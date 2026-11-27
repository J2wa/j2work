import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
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
      return fail("Too many submissions right now. Please try again later.", 429);
    }

    const existing = await db().query.domainSpecialists.findFirst({
      where: eq(domainSpecialists.email, parsed.data.email),
    });

    const now = new Date();
    if (existing) {
      await db()
        .update(domainSpecialists)
        .set({
          fullName: parsed.data.fullName,
          primaryDomain: parsed.data.primaryDomain,
          specialtyDetails: parsed.data.specialtyDetails,
          yearsExperience: parsed.data.yearsExperience,
          highestCredential: parsed.data.highestCredential,
          preferredWorkSetting: parsed.data.preferredWorkSetting,
          portfolioUrl: parsed.data.portfolioUrl,
          availabilityNotes: parsed.data.availabilityNotes,
          updatedAt: now,
        })
        .where(eq(domainSpecialists.id, existing.id));
      return Response.json({ ok: true, updated: true });
    }

    await db().insert(domainSpecialists).values({
      id: crypto.randomUUID(),
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    });

    return Response.json({ ok: true, updated: false }, { status: 201 });
  } catch (error) {
    return serviceError(error);
  }
}
