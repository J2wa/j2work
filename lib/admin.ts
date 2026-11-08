import { eq } from "drizzle-orm";
import { redirect, forbidden } from "next/navigation";
import { getSession } from "./auth";
import { db } from "./db";
import { user } from "./db/schema";
import { fail } from "./http";
// Re-read the role so demotion takes effect even for an existing session.
export async function adminAccess() {
  const session = await getSession();
  if (!session) return { error: fail("Please sign in.", 401) };
  const account = await db().query.user.findFirst({
    where: eq(user.id, session.user.id),
  });
  if (!account || account.role !== "admin" || account.banned)
    return { error: fail("Administrator access required.", 403) };
  return { user: account };
}
export async function requireAdmin() {
  const access = await adminAccess();
  if (access.error) {
    if (access.error.status === 401) redirect("/login");
    forbidden();
  }
  return access.user!;
}
