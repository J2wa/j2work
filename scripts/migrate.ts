import { config } from "dotenv";
config({ path: ".env.local" });
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../lib/db";
await migrate(db(), { migrationsFolder: "./drizzle" });
console.log("Careers database migrations applied.");
process.exit(0);
