import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UserItem, FileItem } from "@/lib/types";
import File from "@/lib/schemas/file.schema";
import User from "@/lib/schemas/user.schema";
import connect from "@/lib/db";
import mongoose, { Types } from "mongoose";
import { buildMongodbPath, escapeRegex } from "@/lib/utils/path-util";

async function dfs(file: FileItem, ids: string[], visited: Set<string>) {
    if(visited.has(file._id)) return;
    ids.push(file._id);
    visited.add(file._id);

    const files = await File.find({parent_folder_id: file._id}).lean<FileItem[]>();
    for(const f of files) await dfs(f, ids, visited);
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
            let current_folder_path = buildMongodbPath(file.path, file.name);
            current_folder_path = escapeRegex(current_folder_path);

            await File.updateMany(
                {
                    user_id: user._id,
                    $or: [
                        { _id: file._id },
                        { path: { $regex: `^${current_folder_path}` } }
                    ]
                },
                { is_trash: newTrashState }
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