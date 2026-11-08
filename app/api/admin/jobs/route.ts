import { NextRequest } from "next/server";
import { adminAccess } from "@/lib/admin";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { jobSchema } from "@/lib/validation";
import { fail, sameOrigin, serviceError } from "@/lib/http";
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const access = await adminAccess();
    if (access.error) return access.error;
    const parsed = jobSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const [job] = await db()
      .insert(jobs)
      .values({ id: crypto.randomUUID(), ...parsed.data })
      .returning();
    return Response.json({ job }, { status: 201 });
  } catch (error) {
    return serviceError(error);
  }
}
