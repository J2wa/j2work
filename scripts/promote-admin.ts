import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../lib/db";
import { user } from "../lib/db/schema";
config({ path: ".env.local" });
const email = z.email().safeParse(process.argv[2]?.trim().toLowerCase());
if (!email.success || process.argv.length !== 3) {
  console.error("Usage: npm run admin:promote -- someone@example.com");
  process.exit(1);
}
try {
  const matches = await db()
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${email.data}`);
  if (matches.length !== 1) {
    console.error(
      "Exactly one existing account must match. Sign up first; no accounts were changed.",
    );
    process.exit(1);
  }
  await db()
    .update(user)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(user.id, matches[0].id));
  console.log(
    "Account promoted. Log in with your existing credentials and visit /admin.",
  );
  process.exit(0);
} catch {
  console.error(
    "Promotion failed. Check database configuration and apply migrations first.",
  );
  process.exit(1);
}
