import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { profileSchema } from "@/lib/validation";
import { serializeInterestedRoles } from "@/lib/role-catalog";
import { sameOrigin, fail, serviceError } from "@/lib/http";

export async function PATCH(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const session = await getSession();
    if (!session) return fail("Please sign in.", 401);
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const { interestedRoles, ...rest } = parsed.data;
    await db()
      .update(user)
      .set({
        ...rest,
        interestedRoles: serializeInterestedRoles(interestedRoles),
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));
    return Response.json({ ok: true });
  } catch (error) {
    return serviceError(error);
  }
}
