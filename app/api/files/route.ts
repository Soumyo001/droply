import { connectDb } from "@/lib/db";
import { files } from "@/lib/schema/file_schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async(req: Request) => {
    try {
        const { userId } = await auth();
        if(!userId) {
            return NextResponse.json(
                {message: "Unauthorized user"}, {status:401}
            );
        }

        const requestUrl = new URL(req.url);
        const queryParamUserId = requestUrl.searchParams.get("userId");
        const parentFolderId = requestUrl.searchParams.get("folderId");
        if(!queryParamUserId || queryParamUserId !== userId) {
            return NextResponse.json(
                {message: "User don't have necessary permissions to perform this action"},
                {status: 401}
            );
        }
        const db = connectDb();
        let userFiles;
        if(parentFolderId) {
            userFiles = await db.select()
                            .from(files)
                            .where(
                                and(
                                    eq(files.userId, userId),
                                    eq(files.parentId, parentFolderId)
                                )
                            );
        } else {
            userFiles = await db.select()
                            .from(files)
                            .where(
                                and(
                                    eq(files.userId, userId),
                                    isNull(files.parentId)
                                )
                            );
        }
        return NextResponse.json(
            {userFiles}, {status:200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {error: `Internal server error: ${err}`}, {status: 500}
        );
    }
}