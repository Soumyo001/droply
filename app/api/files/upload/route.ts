import { NextResponse } from "next/server";
import { FileItem, UserItem } from "@/lib/types";
import cloudinary from "@/lib/db/cloudinary";
import File from "@/lib/schemas/file.schema";
import User from "@/lib/schemas/user.schema";
import { auth } from "@clerk/nextjs/server";
import connect from "@/lib/db";
import { buildCloudinaryPath, buildMongodbPath } from "@/lib/utils/path-util";

export const POST = async(req: Request) => {
    try {
        const { userId, isAuthenticated } = await auth();
        if(!userId || !isAuthenticated) {
            return  NextResponse.json(
                {message: "Unauthorized. user must be logged in"}, {status: 401}
            );
        }
        await connect();
        const user = await User.findOne({clerk_id: userId}).lean<UserItem>();
        if(!user) {
            return NextResponse.json(
                {message: "Warning! User not synced. please re-login to sync your account"},
                {status: 404}
            );
        }
        const formData = await req.formData();
        const file = formData.get("file") as File || null;
        const parent_folder_id = formData.get("parent_folder_id") as string || null;
        if(!file) {
            return NextResponse.json(
                {message: "No file provided"}, {status: 400}
            );
        }
        if(!file.type.startsWith("image/")) {
            return NextResponse.json(
                {message: "File type not supported"}, {status: 415}
            );
        }
        if(file.size > 5*1024*1024) {
            return NextResponse.json(
                {message: "Image size must be less than 5MB"}, {status: 400}
            );
        }

        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        let cloudinary_upload_path: string = `droply/${user._id}`;
        let mongodb_parent_folder_path: string = "/";
        if(parent_folder_id) {
            const parent_folder = await File
                                    .findOne({_id: parent_folder_id, user_id: user._id})
                                    .lean<FileItem>();
            if(!parent_folder) {
                return NextResponse.json(
                    {message: "Parent folder not found"}, {status: 404}
                );
            }
            // console.log({id: parent_folder._id, name: parent_folder.name, parent_path: parent_folder.path})
            mongodb_parent_folder_path = buildMongodbPath(parent_folder.path, parent_folder.name);
            cloudinary_upload_path = buildCloudinaryPath(String(user._id), parent_folder.path, parent_folder.name);
        }
        
        const cloudinary_upload_response = await cloudinary.uploader.upload(dataUri, {
            folder: cloudinary_upload_path,
            resource_type: "image"
        });

        const new_file = await File.create({
            name:                   file.name,
            path:                   mongodb_parent_folder_path,
            size:                   file.size,
            type:                   file.type,
            file_url:               cloudinary_upload_response.secure_url,
            thumbnail_url:          cloudinary_upload_response.secure_url.replace(
                                        "/upload/",
                                        "/upload/w_200,h_200,c_fill/"   
                                    ),
            cloudinary_public_id:   cloudinary_upload_response.public_id,
            user_id:                user._id,
            parent_folder_id:       parent_folder_id || null
        });
        return NextResponse.json(
            {message: "File upload successful", file: new_file}, {status: 201}
        );
    } catch (err: any) {
        return NextResponse.json(
            {message: `Server error: ${err.message}`}, {status: 500}
        );
    }
}