import { NextResponse } from "next/server";
import { UserItem, FileItem } from "@/lib/types";
import User from "@/lib/schemas/user.schema";
import File from "@/lib/schemas/file.schema";
import { auth } from "@clerk/nextjs/server";
import connect from "@/lib/db";
import { Types } from "mongoose";

export const PATCH = async(req: Request, {params}: {params: Promise<{id: string}>}) => {
    try {
        const {userId, isAuthenticated} = await auth();
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
                        });
        if(!file) {
            return NextResponse.json(
                {message: "File not found"}, {status: 404}
            );
        }
        file.is_starred = !file.is_starred;
        await file.save();

        // const updated_data = await File.findOneAndUpdate(
        //     {_id: id, parent_folder_id: parent_folder_id || null, user_id: user._id},
        //     [{
        //         $set: {is_starred: {$not: "$is_starred"}}
        //     }],
        //     {returnDocument: "after"}
        // ).lean<FileItem>();

        // if(!updated_data) return NextResponse.json(
        //     {message: "Failed to update data. Please try again"}, {status: 500}
        // );
        return NextResponse.json(
            {message: `${file.is_starred? "Added to":"Removed from"} starred`, file}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {message: `Server error: ${err.message}`}, {status: 500}
        );
    }
}