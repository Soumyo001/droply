import * as dotenv from "dotenv";
import { defineConfig } from 'drizzle-kit';

dotenv.config({path: ".env.local"});

if(!process.env.DATABASE_URI) {
    throw new Error("Database url is not set in .env.local");
}

export default defineConfig({
  schema: './lib/schema/file_schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URI!,
  },
  migrations: {
    table: "__drizzle_migration",
    schema: "public"
  },
  verbose: true,
  strict: true
});
