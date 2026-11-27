import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { domainSpecialists } from "@/lib/db/schema";
import { specialistSchema } from "@/lib/validation";
import { allowSpecialistEntry } from "@/lib/limits";
import { sameOrigin, fail, serviceError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    if (!process.env.TURSO_DATABASE_URL) {
      return fail(
        "The specialist talent pool is getting ready. Please check back shortly.",
        503,
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = specialistSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message, 400);
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";
    const allowed = await allowSpecialistEntry(
      `${ip}:${parsed.data.email.slice(0, 80)}`,
    );
    if (!allowed) {
      return fail(
        "Too many submissions right now. Please try again later.",
        429,
      );
    }

    const now = new Date();
    await db()
      .insert(domainSpecialists)
      .values({
        id: crypto.randomUUID(),
        ...parsed.data,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: domainSpecialists.email });

    return Response.json({ ok: true });
  } catch (error) {
    return serviceError(error);
  }
}
