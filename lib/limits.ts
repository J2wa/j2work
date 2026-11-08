import { sql } from "drizzle-orm";
import { db } from "./db";
import { rateLimit } from "./db/schema";
export async function allowUpload(userId: string) {
  const key = `resume:${userId}:${Math.floor(Date.now() / 3600000)}`;
  const rows = await db()
    .insert(rateLimit)
    .values({ id: crypto.randomUUID(), key, count: 1, lastRequest: Date.now() })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: { count: sql`${rateLimit.count}+1`, lastRequest: Date.now() },
    })
    .returning({ count: rateLimit.count });
  return rows[0].count <= 10;
}

export async function allowEmailRetry(userId: string) {
  const key = `email-retry:${userId}:${Math.floor(Date.now() / 3600000)}`;
  const [row] = await db()
    .insert(rateLimit)
    .values({ id: crypto.randomUUID(), key, count: 1, lastRequest: Date.now() })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: { count: sql`${rateLimit.count}+1`, lastRequest: Date.now() },
    })
    .returning({ count: rateLimit.count });
  return row.count <= 20;
}
