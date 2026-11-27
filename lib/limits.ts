import { sql } from "drizzle-orm";
import { db } from "./db";
import { rateLimit } from "./db/schema";
async function allowHourly(scope: string, userId: string, limit: number) {
  const now = Date.now();
  const key = `${scope}:${userId}:${Math.floor(now / 3600000)}`;
  const [row] = await db()
    .insert(rateLimit)
    .values({ id: crypto.randomUUID(), key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: { count: sql`${rateLimit.count}+1`, lastRequest: now },
    })
    .returning({ count: rateLimit.count });
  return row.count <= limit;
}

export function allowUpload(userId: string) {
  return allowHourly("resume", userId, 10);
}

export function allowEmailRetry(userId: string) {
  return allowHourly("email-retry", userId, 20);
}

export function allowAi(userId: string, kind: "polish" | "image") {
  return allowHourly(`ai-${kind}`, userId, kind === "image" ? 10 : 30);
}

export function allowSpecialistEntry(key: string) {
  return allowHourly("specialist-pool", key, 10);
}
