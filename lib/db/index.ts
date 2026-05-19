import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export default async function connect() {
    const connectionState = mongoose.connection.readyState;
    switch(connectionState) {
        case 1:
            console.log("Already connected");
            break;
        case 2:
            console.log("Connecting...");
            await mongoose.connection.asPromise();
            break;
        default:
            try {
                await mongoose.connect(MONGODB_URI!, {
                    dbName: "droply",
                    bufferCommands: true
                });
            } catch (err: any) {
                console.log("Error connecting mongodb: ", err.message);
                throw new Error(`Error connecting mongodb: ${err.message}`);
            }
            break;
    }
}