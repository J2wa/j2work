import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { sameOrigin, fail, serviceError } from "@/lib/http";
import { sendApplicationEmail } from "@/lib/application-email";
const schema = z.object({
  id: z.string().min(1).max(80),
  status: z
    .enum(["submitted", "reviewing", "shortlisted", "hired", "not_selected"])
    .optional(),
  retryEmail: z.boolean().optional(),
});
export async function PATCH(r: NextRequest) {
  try {
    if (!sameOrigin(r)) return fail("Invalid origin.", 403);
    if (!(await getAdmin())) return fail("Administrator access required.", 403);
    const parsed = schema.safeParse(await r.json());
    if (!parsed.success) return fail("Invalid application update.");
    const { id, status, retryEmail } = parsed.data;
    if (
      !(await db().query.applications.findFirst({
        where: eq(applications.id, id),
      }))
    )
      return fail("Application not found.", 404);
    if (status)
      await db()
        .update(applications)
        .set({ status })
        .where(eq(applications.id, id));
    if (retryEmail) await sendApplicationEmail(id);
    return Response.json({ ok: true });
  } catch (e) {
    return serviceError(e);
  }
}
