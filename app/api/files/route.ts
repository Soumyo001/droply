import { NextResponse } from "next/server";
import { FileItem, UserItem } from "@/lib/types";
import File from "@/lib/schemas/file.schema";
import User from "@/lib/schemas/user.schema";
import { auth } from "@clerk/nextjs/server";
import connect from "@/lib/db";

export const GET = async(req: Request) => {
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
                {message: "Warning! User not synced. Please re-login to sync your account"},
                {status: 404}
            );
        }
        const url = new URL(req.url);
        const parent_folder_id = url.searchParams.get("parentId");
        const files = await File.find({
                        parent_folder_id: parent_folder_id || null,
                        user_id: user._id,
                        is_trash: false,
                    }).sort({is_folder: -1, name: 1}).lean<FileItem[]>();
                    
        return NextResponse.json(
            {message: "Files fetched", files}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {message: `Server Error: ${err.message}`}, {status: 500}
        );
    }
}