import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { adminAccess } from "@/lib/admin";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { fail, serviceError } from "@/lib/http";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = await adminAccess();
    if (access.error) return access.error;
    const { id } = await params;
    const application = await db().query.applications.findFirst({
      where: eq(applications.id, id),
    });
    if (!application) return fail("Application not found.", 404);
    // Download the immutable resume submitted with this application, not a later replacement.
    const result = await get(application.resumeUrl, { access: "private" });
    if (!result || result.statusCode !== 200)
      return fail("Resume not found.", 404);
    const ext = new URL(application.resumeUrl).pathname
      .toLowerCase()
      .endsWith(".docx")
      ? "docx"
      : "pdf";
    return new Response(result.stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="resume.${ext}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return serviceError(error);
  }
}
