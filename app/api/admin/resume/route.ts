import { NextRequest } from "next/server";
import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { fail, serviceError } from "@/lib/http";
export async function GET(r: NextRequest) {
  try {
    if (!(await getAdmin())) return fail("Administrator access required.", 403);
    const record = await db().query.applications.findFirst({
      where: eq(applications.id, r.nextUrl.searchParams.get("id") || ""),
    });
    if (!record) return fail("Application not found.", 404);
    const result = await get(record.resumeUrl, { access: "private" });
    if (!result || result.statusCode !== 200)
      return fail("Resume not found.", 404);
    const extension = new URL(record.resumeUrl).pathname
      .toLowerCase()
      .endsWith(".docx")
      ? "docx"
      : "pdf";
    return new Response(result.stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="resume.${extension}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return serviceError(e);
  }
}
