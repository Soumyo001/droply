import { and, eq } from "drizzle-orm";
import { connectDb } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { v4 } from "uuid";
import { files } from "@/lib/schema/file_schema";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
    try {
        const { userId } = await auth();
        if(!userId) {
            return NextResponse.json(
                {message: "Unauthorized user"}, {status: 401}
            );
        }

        const { 
            name, 
            userId:bodyUserId,
            parentId = null
        } = await request.json();
        if(bodyUserId !== userId) {
            return NextResponse.json(
                {message: "user don't meet necessary permissions"}, {status: 401}
            );
        }
        if(!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json(
                {message: "Folder name cannot be empty"}, {status: 400}
            );
        }
        const db = connectDb();
        if(parentId) {
            const parentFolder = await db.select()
                                    .from(files)
                                    .where(
                                        and(
                                            eq(files.id, parentId),
                                            eq(files.userId, userId),
                                            eq(files.isFolder, true)
                                        )
                                    );
            if(!parentFolder) {
                return NextResponse.json(
                    {message: "Parent folder not found"}, {status:404}
                );
            }
        }

        const folderData = {
            id: v4(),
            name: name.trim(),
            path: `/folders/${userId}/${v4()}`,
            size: 0,
            type: "folder",
            fileUrl: "",
            thumbnailUrl: null,
            userId: userId,
            parentId: parentId,
            isFolder: true
        }


    } catch (err: any) {
        
    }
}