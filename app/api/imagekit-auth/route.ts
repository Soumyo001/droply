import ImageKit from "imagekit";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ""
});

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