import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminAccess } from "@/lib/admin";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { jobSchema } from "@/lib/validation";
import { fail, sameOrigin, serviceError } from "@/lib/http";
const updateSchema = z.union([
  jobSchema,
  z.object({ isActive: z.boolean() }).strict(),
]);
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const access = await adminAccess();
    if (access.error) return access.error;
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return fail("Check all job fields and try again.");
    const { id } = await params;
    const [job] = await db()
      .update(jobs)
      .set(parsed.data)
      .where(eq(jobs.id, id))
      .returning();
    if (!job) return fail("Job not found.", 404);
    return Response.json({ job });
  } catch (error) {
    return serviceError(error);
  }
}
