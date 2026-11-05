import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { projectSchema } from "@/lib/validation";
import { sameOrigin, fail, serviceError } from "@/lib/http";
async function save(request: NextRequest, update: boolean) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    if (!(await getAdmin())) return fail("Administrator access required.", 403);
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    if (update) {
      if (typeof body.id !== "string") return fail("Project ID required.");
      const rows = await db()
        .update(jobs)
        .set(parsed.data)
        .where(eq(jobs.id, body.id))
        .returning({ id: jobs.id });
      if (!rows.length) return fail("Project not found.", 404);
      return Response.json(rows[0]);
    }
    const id = crypto.randomUUID();
    await db()
      .insert(jobs)
      .values({ id, ...parsed.data });
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    return serviceError(e);
  }
}
export const POST = (r: NextRequest) => save(r, false);
export const PATCH = (r: NextRequest) => save(r, true);
