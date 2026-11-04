import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
let instance: ReturnType<typeof createDb> | undefined;
function createDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not configured");
  if (
    process.env.VERCEL &&
    !url.startsWith("libsql://") &&
    !url.startsWith("https://")
  )
    throw new Error("Vercel requires a remote Turso database");
  return drizzle(
    createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
    { schema },
  );
}
export function db() {
  return (instance ??= createDb());
}
