import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "../schema/file_schema";

const POSTGREDB_URI = process.env.DATABASE_URI

export function connectDb() {
    const sql = neon(POSTGREDB_URI!);
    return drizzle(sql, {schema});
}

export const connectSql = () => neon(POSTGREDB_URI!);