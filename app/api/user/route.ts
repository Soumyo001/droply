import User from "@/lib/schemas/user.schema"
import { UserItem } from "@/lib/types/user.type"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import connect from "@/lib/db"


export const GET = async() => {
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
                {message: "User not synced"}, {status: 404}
            );
        }
        return NextResponse.json(
            {message: "User found", user}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {message: `Server error: ${err.message}`}, {status: 500}
        );
    }
}

export const POST = async(req: Request) => {
    try {
        const { userId, isAuthenticated } = await auth();
        if(!userId || !isAuthenticated) {
            return NextResponse.json(
                {message: "Unauthorized. User account must be created before sync"}, {status: 401}
            );
        }
        const { email } = await req.json();
        await connect();
        const user = await User.findOne({clerk_id: userId, email}).lean<UserItem>();
        if(user) {
            return NextResponse.json(
                {message: "Conflict! User account already synced"},
                {status: 409}
            );
        }
        const syncedUser = await User.findOneAndUpdate(
            {email},
            {
                $set: {clerk_id: userId},
                $setOnInsert: {email}
            },
            {upsert: true, returnDocument: "after"}
        ).lean<UserItem>();
        if(!syncedUser) {
            return NextResponse.json(
                {message: "Sync failed. please try again on next login"}, {status: 500}
            );
        }
        return NextResponse.json(
            {message: "User account synced", user: syncedUser}, {status: 200}
        );
    } catch (err: any) {
        if(err.code === 11000) {
            return NextResponse.json(
                {message: "Conflict! User with this email already exist"}, {status: 409}
            );
        }
        return NextResponse.json(
            {message: `Unknown error occured: ${err.message}`}, {status: 500}
        );
    }
}