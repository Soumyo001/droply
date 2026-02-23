import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { files } from "@/lib/schema/file_schema";
import { connectDb } from "@/lib/db";
import { drizzle } from "drizzle-orm/neon-http";

export const POST = async (request: Request) => {
    try {
        const { userId } = await auth();
        if(!userId) {
            return NextResponse.json(
                {message: "Unauthorized user"}, {status: 401}
            );
        }

        const body = await request.json();
        const { imagekit, userId: bodyUserId } = body;
        if(bodyUserId !== userId) {
            return NextResponse.json(
                {message: "user don't meet necessary permissions"}, {status: 401}
            );
        }
        if(!imagekit || !imagekit.url) {
            return NextResponse.json(
                {message: "failed to upload file. please try again"}, {status: 400}
            );
        }

        const { name, size, filePath, url, fileType, thumbnailUrl } = imagekit;
        const fileData = {
            name: name || "untitled",
            path: filePath || `/droply/${userId}/${name}`,
            size: size || 0,
            type: fileType || "image",
            fileUrl: url,
            thumbnailUrl: thumbnailUrl || null,
            userId: userId,
            parentId: null,
            isFolder: false,
            isStarred: false,
            isTrash: false
        };

        const db = connectDb();

        const newFile = await db.insert(files).values(fileData).returning();
        return NextResponse.json(
            {message: "file upload successful", file: newFile}, {status: 200}
        );

    } catch (err: any) {
        return NextResponse.json(
            {error: `Internal server error: ${err}`}, {status: 500}
        );
    }
}