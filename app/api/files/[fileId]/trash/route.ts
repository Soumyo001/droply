import { connectDb } from "@/lib/db";
import { files } from "@/lib/schema/file_schema";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

export const PATCH = async (request:Request, {params}: {params: Promise<{fileId: string}>}) => {
    try {
        const { userId } = await auth();
        if(!userId) {
            return NextResponse.json(
                {message: "Unauthorized user"}, {status: 401}
            );
        }
        const { fileId } = await params;
        if(!fileId) {
            return NextResponse.json(
                {message: "Invalid file ID"}, {status: 400}
            );
        }
        const db = connectDb();
        const [file] = await db.select().from(files).where(
            and(
                eq(files.id, fileId),
                eq(files.userId,  userId)
            )
        );
        if(!file) {
            return NextResponse.json(
                {message: "File not found. please try again"}, {status: 404}
            );
        }
        const updatedFiles = await db.update(files).set({isTrash: !file.isTrash}).where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        ).returning();
        console.log(updatedFiles);
        const updatedFile = updatedFiles[0];
        return NextResponse.json(
            {message: "File sent to trash", file: updatedFile}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {error: "Failed to move file to the trash"}, {status: 500}
        );
    }
}