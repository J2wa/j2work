import {
  applicationEmailPayload,
  sendApplicationEmail,
} from "@/lib/application-email";
import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { applications, applicationEmails, jobs, user } from "@/lib/db/schema";
import { applicationSchema } from "@/lib/validation";
import { sameOrigin, fail, serviceError } from "@/lib/http";
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const session = await getSession();
    if (!session) return fail("Please sign in.", 401);
    const parsed = applicationSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const result = await db().transaction(async (tx) => {
      const applicant = await tx.query.user.findFirst({
        where: eq(user.id, session.user.id),
      });
      if (!applicant?.resumeUrl)
        return {
          error: "Complete your profile and upload a resume first.",
          status: 422,
        };
      const job = await tx.query.jobs.findFirst({
        where: and(eq(jobs.id, parsed.data.jobId), eq(jobs.isActive, true)),
      });
      if (!job)
        return {
          error: "This role is no longer accepting applications.",
          status: 404,
        };
      const inserted = await tx
        .insert(applications)
        .values({
          id: crypto.randomUUID(),
          applicantId: applicant.id,
          jobId: job.id,
          coverNote: parsed.data.coverNote,
          resumeUrl: applicant.resumeUrl,
        })
        .onConflictDoNothing({
          target: [applications.applicantId, applications.jobId],
        })
        .returning({ id: applications.id });
      if (!inserted.length)
        return {
          error: "You have already applied for this role.",
          status: 409,
        };
      await tx
        .insert(applicationEmails)
        .values({
          applicationId: inserted[0].id,
          payload: applicationEmailPayload({
            id: inserted[0].id,
            name: applicant.name,
            email: applicant.email,
            phone: applicant.phone,
            title: job.title,
            note: parsed.data.coverNote,
          }),
        });
      return { id: inserted[0].id };
    });
    if ("error" in result) return fail(result.error!, result.status);
    try {
      await sendApplicationEmail(result.id!);
    } catch {
      console.error("Application saved; notification pending");
    }
    return Response.json(result, { status: 201 });
  } catch (error) {
    return serviceError(error);
  }
}
