import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept",
};

function siteOrigin(request: NextRequest) {
  const origins = [process.env.CAREERS_SITE_URL, process.env.BETTER_AUTH_URL, request.nextUrl.origin];
  for (const origin of origins) {
    if (!origin) continue;
    try {
      const url = new URL(origin);
      if ((url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password) {
        return url.origin;
      }
    } catch {
      continue;
    }
  }
  return "https://careers.acesintelligence.xyz";
}

function resolveHeaderImage(value: string | null, origin: string) {
  if (!value) return null;
  if (/^\/api\/job-images\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(value)) {
    return new URL(value, origin).href;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const origin = siteOrigin(request);
  if (!process.env.TURSO_DATABASE_URL) {
    return Response.json(
      {
        error: "Careers portal is not configured.",
        careersUrl: `${origin}/careers`,
        count: 0,
        jobs: [],
      },
      { status: 503, headers: { ...corsHeaders, "Cache-Control": "no-store" } },
    );
  }
  try {
    const active = await db()
      .select({
        id: jobs.id,
        title: jobs.title,
        department: jobs.department,
        roleType: jobs.roleType,
        workSetting: jobs.workSetting,
        location: jobs.location,
        remote: jobs.remote,
        headerImageUrl: jobs.headerImageUrl,
        hourlyRatePhpCents: jobs.hourlyRatePhpCents,
        hourlyRateUsdCents: jobs.hourlyRateUsdCents,
        summary: jobs.summary,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(eq(jobs.isActive, true))
      .orderBy(desc(jobs.createdAt));

    const payload = active.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department,
      roleType: job.roleType,
      workSetting: job.workSetting,
      location: job.location,
      remote: job.remote,
      headerImageUrl: resolveHeaderImage(job.headerImageUrl, origin),
      hourlyRatePhpCents: job.hourlyRatePhpCents,
      hourlyRateUsdCents: job.hourlyRateUsdCents,
      summary: job.summary,
      createdAt: job.createdAt.toISOString(),
      url: `${origin}/careers/jobs/${encodeURIComponent(job.id)}`,
    }));

    return Response.json(
      {
        careersUrl: `${origin}/careers`,
        count: payload.length,
        jobs: payload,
      },
      {
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error(
      "Public jobs feed failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return Response.json(
      {
        error: "We couldn’t load open roles right now.",
        careersUrl: `${origin}/careers`,
        count: 0,
        jobs: [],
      },
      { status: 503, headers: { ...corsHeaders, "Cache-Control": "no-store" } },
    );
  }
}
