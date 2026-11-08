import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { adminAccess } from "@/lib/admin";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { statusSchema } from "@/lib/validation";
import { fail, sameOrigin, serviceError } from "@/lib/http";
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const access = await adminAccess();
    if (access.error) return access.error;
    const parsed = statusSchema.safeParse(await request.json());
    if (!parsed.success) return fail("Choose a valid application status.");
    const { id } = await params;
    const [row] = await db()
      .update(applications)
      .set(parsed.data)
      .where(eq(applications.id, id))
      .returning({ id: applications.id });
    if (!row) return fail("Application not found.", 404);
    return Response.json({ id: row.id, status: parsed.data.status });
  } catch (error) {
    return serviceError(error);
  }
}
