import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import imagekit from "@/lib/imagekit/get_imagekit_auth";

export const GET = async () => {
    try {
        // user authorization logic
        const { userId } = await auth();
        if(!userId) {
            return NextResponse.json(
                {message: "Unauthorized user"},
                {status: 401}
            );
        }

        // authParams
        const authParams = imagekit.getAuthenticationParameters();
        return NextResponse.json(
            {authParams}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {error: `Internal server error ${err}`}, {status: 500}
        );
    }
}