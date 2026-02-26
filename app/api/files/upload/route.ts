import { connectDb } from "@/lib/db";
import imagekit from "@/lib/imagekit/get_imagekit_auth";
import { files } from "@/lib/schema/file_schema";
import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { v4 } from "uuid";

export const POST = async(request: Request) => {
    try {
        const { userId } = await auth();
        if(!userId) {
            return NextResponse.json(
                {message: "Unauthorized user"}, {status: 401}
            );
        }
        
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const formUserId = formData.get("userId") as string;
        const parentId = (formData.get("parentId") as string) || null;

        if(formUserId !== userId) {
            return NextResponse.json(
                {message: "Unauthorized user"}, {status: 401}
            );
        }
        if(!file) {
            return NextResponse.json(
                {message: "File not found. please try again."}, {status: 404}
            );
        }
        if(!file.type.startsWith("image/") && file.type !== "application/pdf") {
            return NextResponse.json(
                {message: "File must be an image or pdf"}, {status: 400}
            );
        }

        const db = connectDb();
        if(parentId) {
            const [parentFolder] = await db.select()
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
                    {message: "parent folder not found"}, {status: 404}
                );
            }
        }

        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const folderPath = parentId ?
                    `/droply/${userId}/folder/${parentId}` :
                    `/droply/${userId}`;
        const fileExtension = file.name.split(".").pop() || "unknown";
        const uniqueFileName = `${v4()}.${fileExtension}`;
        
        const fileUploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: uniqueFileName,
            folder: folderPath,
            useUniqueFileName: false
        });
        const filedata = {
            name: file.name,
            path: fileUploadResponse.filePath,
            size: file.size,
            type: file.type,
            fileUrl: fileUploadResponse.url,
            thumbnailUrl: fileUploadResponse.thumbnailUrl,
            userId: userId,
            parentId: parentId,
            isFolder: false,
            isStarred: false,
            isTrash: false
        };
        const newFile = await db.insert(files).values(filedata).returning();
        return NextResponse.json({
            message: "File upload successful",
            file: newFile
        }, {status: 200});
        
    } catch (err: any) {
        return NextResponse.json(
            {error: `Internal server error: ${err}`}, {status: 500}
        );
    }
}