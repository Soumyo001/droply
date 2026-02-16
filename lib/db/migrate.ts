import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({path: ".env.local"});

if(!process.env.DATABASE_URI) {
    throw new Error("Database URI is not set in .env.local");
}

async function runMigration() {
    try {
        const sql = neon(process.env.DATABASE_URI!);
        const db = drizzle(sql);
        await migrate(db, {migrationsFolder: "./drizzle"});
        console.log("All migrations successful");
    } catch (err: any) {
        console.log(`Unknown error occured: ${err.message}`);
        process.exit(1);
    }
}

runMigration();