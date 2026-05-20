import { NextResponse } from "next/server";
import { UserItem, FileItem } from "@/lib/types";
import User from "@/lib/schemas/user.schema";
import File from "@/lib/schemas/file.schema";
import { auth } from "@clerk/nextjs/server";
import connect from "@/lib/db";
import { Types } from "mongoose";

export const GET = async(req: Request) => {
    try {
        const { userId, isAuthenticated } = await auth();
        if(!userId || !isAuthenticated) {
            return NextResponse.json(
                {message: "Unauthorized. User not logged in"}, {status: 401}
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
        const url = new URL(req.url);
        const parent_folder_id = url.searchParams.get("parentId");
        if(parent_folder_id && !Types.ObjectId.isValid(parent_folder_id)) {
            return NextResponse.json(
                {message: "Invalid parent ID"}, {status: 400}
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
        let files: FileItem[] = [];
        if(parent_folder_id) {
            files = await File.find({
                        parent_folder_id,
                        user_id: user._id,
                        is_trash: true
                    }).sort({is_folder: -1, name: 1}).lean<FileItem[]>();
        } else {
            const all_trashed = await File.find({
                        user_id: user._id,
                        is_trash: true
                    }).sort({is_folder: -1, name: 1}).lean<FileItem[]>();

            const all_trash_ids = new Set<string>(all_trashed.map(f => String(f._id)));
            files = all_trashed.filter(f => 
                !f.parent_folder_id || !all_trash_ids.has(String(f.parent_folder_id))
            );
        }

        return NextResponse.json(
            {message: "Trashed files/folders fetched", files}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {message: `Server error: ${err.message}`}, {status: 500}
        );
    }
}