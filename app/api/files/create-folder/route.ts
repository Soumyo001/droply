import { NextResponse } from "next/server";
import File from "@/lib/schemas/file.schema";
import User from "@/lib/schemas/user.schema";
import { FileItem, UserItem } from "@/lib/types";
import connect from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { buildMongodbPath } from "@/lib/utils/path-util";

export const POST = async(req: Request) => {
    try {
        const { userId, isAuthenticated } = await auth();
        if(!userId || !isAuthenticated) {
            return NextResponse.json(
                {message: "Unauthorized. User must be logged in"}, {status: 401}
            );
        }
        await connect();
        const user = await User.findOne({clerk_id: userId}).lean<UserItem>();
        if(!user) {
            return NextResponse.json(
                {message: "Warning! user account not synced. please re-login to sync your account"},
                {status: 404}
            );
        }
        const { name, parent_folder_id } = await req.json();
        const folderName = name.trim();
        if(!folderName) {
            return NextResponse.json(
                {message: "Need folder name"}, {status: 400}
            );
        }
        let mongodb_parent_folder_path = `/`;
        if(parent_folder_id) {
            const parent_folder = await File
                                    .findOne({_id: parent_folder_id, user_id: user._id})
                                    .lean<FileItem>();
            if(!parent_folder) {
                return NextResponse.json(
                    {message: "Parent folder not found"}, {status: 404}
                );
            }
            mongodb_parent_folder_path = buildMongodbPath(parent_folder.path, parent_folder.name);
        }
        const new_folder = await File.create({
            name:                   folderName,
            path:                   mongodb_parent_folder_path,
            size:                   0,
            type:                   "folder",
            file_url:               null,
            thumbnail_url:          null,
            cloudinary_public_id:   null,
            user_id:                user._id,
            parent_folder_id:       parent_folder_id || null,
            is_folder:              true
        });
        return NextResponse.json(
            {message: "New folder created", folder: new_folder}, {status: 201}
        );
    } catch (err: any) {
        return NextResponse.json(
            {message: `Server error: ${err.message}`}, {status: 500}
        );
    }
}