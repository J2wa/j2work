import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { fail, serviceError } from "@/lib/http";
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Please sign in.", 401);
    const applicant = await db().query.user.findFirst({
      where: eq(user.id, session.user.id),
    });
    if (!applicant?.resumeUrl) return fail("Resume not found.", 404);
    const result = await get(applicant.resumeUrl, { access: "private" });
    if (!result || result.statusCode !== 200)
      return fail("Resume not found.", 404);
    const name = (applicant.resumeName || "resume.pdf").replace(
      /[^a-zA-Z0-9._ -]/g,
      "_",
    );
    return new Response(result.stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return serviceError(error);
  }
}
