import { after, NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { adminAccess } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  applicationEmailTables,
  deliverApplicationEmail,
  emailConfiguration,
} from "@/lib/email";
import { allowEmailRetry } from "@/lib/limits";
import { fail, sameOrigin, serviceError } from "@/lib/http";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const access = await adminAccess();
    if (access.error) return access.error;
    const kind = request.nextUrl.searchParams.get("kind") ?? "recruitment";
    if (kind !== "recruitment" && kind !== "confirmation")
      return fail("Invalid email type.");
    if (!emailConfiguration(kind))
      return fail(
        "Configure Resend and CAREERS_SITE_URL before retrying.",
        503,
      );
    const { id } = await params;
    const table = applicationEmailTables[kind];
    const [row] = await db()
      .select()
      .from(table)
      .where(eq(table.applicationId, id));
    if (!row) return fail("No queued notification for this application.", 404);
    if (row.state === "sent") return fail("Notification already sent.", 409);
    if (row.state === "needs_review")
      return fail("Check Resend logs: the safe retry window has expired.", 409);
    if (row.lastAttemptAt && Date.now() - row.lastAttemptAt.getTime() < 60000)
      return fail("Wait one minute before retrying.", 429);
    if (!(await allowEmailRetry(access.user!.id)))
      return fail("Too many retries. Try again in an hour.", 429);
    after(() => deliverApplicationEmail(id, kind));
    return Response.json({ queued: true }, { status: 202 });
  } catch (error) {
    return serviceError(error);
  }
}
