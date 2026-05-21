import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UserItem, FileItem } from "@/lib/types";
import File from "@/lib/schemas/file.schema";
import User from "@/lib/schemas/user.schema";
import connect from "@/lib/db";
import { Types } from "mongoose";
import cloudinary from "@/lib/db/cloudinary";
import { buildCloudinaryPath } from "@/lib/utils/path-util";

async function dfs(v_id: string, ids: string[], user_id: string) {
    ids.push(v_id);

    const child_files = await File
                    .find({parent_folder_id: v_id, user_id})
                    .select({_id: 1})
                    .lean<{_id: string|Types.ObjectId}[]>();

    const promises = child_files.map(f => dfs(String(f._id), ids, user_id));
    await Promise.all(promises);
    // for(const f of child_files) await dfs(String(f._id), ids, user_id);
}


export const PATCH = async(req: Request, {params}: {params: Promise<{id: string}>}) => {
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
                {message: "Warning! User account not synced. Please re-login to sync your account"},
                {status: 404}
            );
        }
        const { id } = await params;
        const { parent_folder_id } = await req.json();
        if(!id || !Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {message: "Invalid file/folder ID"}, {status: 400}
            );
        }
        if(parent_folder_id && !Types.ObjectId.isValid(parent_folder_id)) {
            return NextResponse.json(
                {message: "Invalid parent folder ID"}, {status: 400}
            );
        }
        if(parent_folder_id) {
            const parent_folder = await File
                                    .findOne({_id: parent_folder_id, user_id: user._id})
                                    .lean<FileItem>();
            if(!parent_folder) {
                return NextResponse.json(
                    {message: "Parent folder not found"}, {status: 404}
                );
            }
        }
        const file = await File.findOne({
                                _id: id,
                                parent_folder_id: parent_folder_id || null,
                                user_id: user._id
                            }).lean<FileItem>();
        if(!file) {
            return NextResponse.json(
                {message: "File not found"}, {status: 404}
            );
        }
        const newTrashState = !file.is_trash;
        if(file.is_folder) {
            const all_ids: string[] = [];
            await dfs(String(file._id), all_ids, String(user._id));
            await File.updateMany(
                {
                    _id: {$in: all_ids},
                    user_id: user._id
                },
                {is_trash: newTrashState}
            );

        } else {
            await File.findOneAndUpdate(
                {_id: file._id, user_id: user._id, parent_folder_id: parent_folder_id || null},
                {
                    $set: {is_trash: newTrashState}
                }
            );
        }
        
        return NextResponse.json(
            {message: newTrashState? `Moved to trash`:"Restored from trash"}, 
            {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {message: `Server error: ${err.message}`}, {status: 500}
        );
    }
}

export const DELETE = async(req: Request, {params}: {params: Promise<{id: string}>}) => {
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
                {message: "Warning! User account not synced. please re-login to sync your account"},
                {status: 404}
            );
        }
        const { id } = await params;
        const { parent_folder_id } = await req.json();
        if(!id || !Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {message: "Invalid ID"}, {status: 400}
            );
        }
        if(parent_folder_id && !Types.ObjectId.isValid(parent_folder_id)) {
            return NextResponse.json(
                {message: "Invalid parent folder ID"}, {status: 400}
            );
        }
        if(parent_folder_id) {
            const parent_folder = await File
                                    .findOne({_id: parent_folder_id, user_id: user._id})
                                    .lean<FileItem>();
            if(!parent_folder) {
                return NextResponse.json(
                    {message: "Parent folder not found"}, {status: 404}
                );
            }
        }
        const file = await File.findOne({
                        _id: id,
                        parent_folder_id: parent_folder_id || null,
                        user_id: user._id,
                        is_trash: true
                    }).lean<FileItem>();
        if(!file) {
            return NextResponse.json(
                {message: "File not found"}, {status: 404}
            );
        }
        if(file.is_folder) {
            const all_ids: string[] = [];
            await dfs(String(file._id), all_ids, String(user._id));

            // handle cloudinary api delete first
            const image_files = await File.find({
                                        _id: {$in: all_ids},
                                        user_id: user._id,
                                        cloudinary_public_id: {$ne: null},
                                        is_folder: false
                                    })
                                    .select({cloudinary_public_id: 1})
                                    .lean<{cloudinary_public_id: string}[]>();
            if(image_files.length > 0) {
                const public_ids = image_files.map(e => e.cloudinary_public_id);
                const BATCH_SIZE = 80;
                for(let i = 0; i < public_ids.length; i+=BATCH_SIZE) {
                    await cloudinary.api.delete_resources(public_ids.slice(i, i + BATCH_SIZE));
                }
            }
            // handle database delete
            await File.deleteMany(
                {_id: {$in: all_ids}, user_id: user._id}
            );
        } else {
            if(file.cloudinary_public_id) {
                await cloudinary.uploader.destroy(file.cloudinary_public_id);
            }
            await File.findByIdAndDelete(file._id);
        }
        return NextResponse.json(
            {message: `${file.is_folder? "Folder and all it's contents are":"File has been"} permanently deleted`},
            {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {message: `Server error: ${err.message}`}, {status: 500}
        );
    }
}