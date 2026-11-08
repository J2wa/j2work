import { Resend } from "resend";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { applicationEmails, applications, jobs, user } from "./db/schema";
import { recruitmentEmail } from "./email-template";
export function emailConfiguration() {
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CAREERS_ADMIN_EMAIL || "acesintelligenceph@gmail.com";
  const site = process.env.CAREERS_SITE_URL;
  if (
    !process.env.RESEND_API_KEY ||
    !z.email().safeParse(from).success ||
    !z.email().safeParse(to).success ||
    !site
  )
    return null;
  try {
    const url = new URL(site);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return { from: from!, to, site: url.origin };
  } catch {
    return null;
  }
}
type EmailPayload = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};
type Sender = (
  payload: EmailPayload,
  key: string,
) => Promise<{ data: { id: string } | null; error: unknown }>;
// No retries after the provider's 24-hour deduplication window: an uncertain
// response may already represent a delivered email. Leave it for manual review.
export const RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
export async function deliverApplicationEmail(
  applicationId: string,
  sender?: Sender,
) {
  let ownedAttempt: Date | null = null;
  try {
    const config = emailConfiguration();
    if (!config) {
      await db()
        .update(applicationEmails)
        .set({ errorCode: "not_configured" })
        .where(
          and(
            eq(applicationEmails.applicationId, applicationId),
            eq(applicationEmails.state, "pending"),
          ),
        );
      return;
    }
    const now = new Date();
    // Atomically claim one delivery without holding a database transaction over
    // other requests or the external email call.
    const claimed = await (async () => {
      const [row] = await db()
        .update(applicationEmails)
        .set({
          state: "sending",
          lastAttemptAt: now,
          attempts: sql`${applicationEmails.attempts}+1`,
        })
        .where(
          and(
            eq(applicationEmails.applicationId, applicationId),
            or(
              eq(applicationEmails.state, "pending"),
              eq(applicationEmails.state, "failed"),
              eq(applicationEmails.state, "sending"),
            ),
            or(
              isNull(applicationEmails.lastAttemptAt),
              lt(
                applicationEmails.lastAttemptAt,
                new Date(now.getTime() - 60000),
              ),
            ),
          ),
        )
        .returning();
      if (!row) return null;
      ownedAttempt = now;
      if (
        row.firstAttemptAt &&
        now.getTime() - row.firstAttemptAt.getTime() >= RETRY_WINDOW_MS
      ) {
        await db()
          .update(applicationEmails)
          .set({ state: "needs_review", errorCode: "retry_window_expired" })
          .where(eq(applicationEmails.applicationId, applicationId));
        return null;
      }
      let payload: EmailPayload;
      if (row.payload) payload = JSON.parse(row.payload);
      else {
        const [a] = await db()
          .select({
            name: user.name,
            email: user.email,
            title: jobs.title,
            date: applications.submittedAt,
          })
          .from(applications)
          .innerJoin(user, eq(user.id, applications.applicantId))
          .innerJoin(jobs, eq(jobs.id, applications.jobId))
          .where(eq(applications.id, applicationId));
        if (!a) throw new Error("ApplicationMissing");
        payload = {
          from: config.from,
          to: config.to,
          ...recruitmentEmail({
            name: a.name,
            email: a.email,
            title: a.title,
            submittedAt: a.date,
            reviewUrl: `${config.site}/admin/applications?id=${encodeURIComponent(applicationId)}`,
          }),
        };
      }
      // Freeze the full request so retries stay identical even if a profile, job
      // title or environment configuration changes after the initial attempt.
      await db()
        .update(applicationEmails)
        .set({
          payload: JSON.stringify(payload),
          firstAttemptAt: row.firstAttemptAt || now,
          errorCode: null,
        })
        .where(eq(applicationEmails.applicationId, applicationId));
      return payload;
    })();
    if (!claimed) return;
    const send: Sender =
      sender ||
      (async (payload, key) => {
        const resend = new Resend(process.env.RESEND_API_KEY);
        return resend.emails.send(payload, { idempotencyKey: key });
      });
    const result = await send(
      claimed,
      `application/${applicationId}/recruitment`,
    );
    if (result.error || !result.data) throw new Error("EmailDeliveryFailed");
    await db()
      .update(applicationEmails)
      .set({
        state: "sent",
        sentAt: new Date(),
        providerId: result.data.id,
        errorCode: null,
      })
      .where(eq(applicationEmails.applicationId, applicationId));
  } catch {
    // No names, emails, credentials, payloads or provider errors in logs.
    console.error(
      "Recruitment email delivery failed; retry from the admin dashboard.",
    );
    try {
      if (!ownedAttempt) return;
      await db()
        .update(applicationEmails)
        .set({ state: "failed", errorCode: "delivery_failed" })
        .where(
          and(
            eq(applicationEmails.applicationId, applicationId),
            eq(applicationEmails.state, "sending"),
            eq(applicationEmails.lastAttemptAt, ownedAttempt),
          ),
        );
    } catch {
      /* a later retry can recover the expired sending lease */
    }
  }
}
