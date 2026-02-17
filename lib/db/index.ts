import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "../schemas/file_schema";

const POSTGREDB_URI = process.env.DATABASE_URI

export default function connect(need_sql: boolean = false) {
    const sql = neon(POSTGREDB_URI!);
    const db = drizzle(sql, { schema });

    return (need_sql? sql: db);
}