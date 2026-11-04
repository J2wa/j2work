import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
export async function GET() {
  try {
    await db().run(sql`SELECT id FROM applicants LIMIT 1`);
    const ready = Boolean(
      process.env.BETTER_AUTH_SECRET && process.env.BLOB_READ_WRITE_TOKEN,
    );
    return Response.json(
      { status: ready ? "ready" : "setup_required" },
      { status: ready ? 200 : 503 },
    );
  } catch {
    return Response.json({ status: "setup_required" }, { status: 503 });
  }
}
