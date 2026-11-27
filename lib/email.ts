import { Resend } from "resend";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import {
  applicationConfirmations,
  applicationEmails,
  applications,
  jobs,
  user,
} from "./db/schema";
import { applicantConfirmationEmail, recruitmentEmail } from "./email-template";

export const applicationEmailTables = {
  recruitment: applicationEmails,
  confirmation: applicationConfirmations,
};
export type ApplicationEmailKind = keyof typeof applicationEmailTables;

export function emailConfiguration(kind: ApplicationEmailKind = "recruitment") {
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CAREERS_ADMIN_EMAIL || "acesintelligenceph@gmail.com";
  const site = process.env.CAREERS_SITE_URL;
  if (
    !process.env.RESEND_API_KEY ||
    !z.email().safeParse(from).success ||
    (kind === "recruitment" && !z.email().safeParse(to).success) ||
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
  kind: ApplicationEmailKind,
  sender?: Sender,
) {
  const table = applicationEmailTables[kind];
  const forApplication = eq(table.applicationId, applicationId);
  const ownedBy = (attempt: Date) =>
    and(
      forApplication,
      eq(table.state, "sending"),
      eq(table.lastAttemptAt, attempt),
    );
  let ownedAttempt: Date | null = null;
  try {
    const config = emailConfiguration(kind);
    if (!config) {
      await db()
        .update(table)
        .set({ errorCode: "not_configured" })
        .where(and(forApplication, eq(table.state, "pending")));
      return;
    }
    const now = new Date();
    // Atomically claim one delivery without holding a database transaction over
    // other requests or the external email call.
    const [row] = await db()
      .update(table)
      .set({
        state: "sending",
        lastAttemptAt: now,
        attempts: sql`${table.attempts}+1`,
      })
      .where(
        and(
          forApplication,
          or(
            eq(table.state, "pending"),
            eq(table.state, "failed"),
            eq(table.state, "sending"),
          ),
          or(
            isNull(table.lastAttemptAt),
            lt(table.lastAttemptAt, new Date(now.getTime() - 60000)),
          ),
        ),
      )
      .returning();
    if (!row) return;
    ownedAttempt = now;
    if (
      row.firstAttemptAt &&
      now.getTime() - row.firstAttemptAt.getTime() >= RETRY_WINDOW_MS
    ) {
      await db()
        .update(table)
        .set({ state: "needs_review", errorCode: "retry_window_expired" })
        .where(ownedBy(now));
      return;
    }
    let payload: EmailPayload;
    if (row.payload) payload = JSON.parse(row.payload);
    else {
      const [applicant] = await db()
        .select({
          name: user.name,
          email: user.email,
          title: jobs.title,
          submittedAt: applications.submittedAt,
        })
        .from(applications)
        .innerJoin(user, eq(user.id, applications.applicantId))
        .innerJoin(jobs, eq(jobs.id, applications.jobId))
        .where(eq(applications.id, applicationId));
      if (!applicant) throw new Error("ApplicationMissing");
      const message =
        kind === "confirmation"
          ? applicantConfirmationEmail({
              ...applicant,
              applicationsUrl: `${config.site}/careers/applications`,
            })
          : recruitmentEmail({
              ...applicant,
              reviewUrl: `${config.site}/admin/applications?id=${encodeURIComponent(applicationId)}`,
            });
      payload = {
        from: config.from,
        to: kind === "confirmation" ? applicant.email : config.to,
        ...message,
      };
    }
    // Freeze the request so retries use identical content and recipients.
    const [ready] = await db()
      .update(table)
      .set({
        payload: JSON.stringify(payload),
        firstAttemptAt: row.firstAttemptAt || now,
        errorCode: null,
      })
      .where(ownedBy(now))
      .returning({ applicationId: table.applicationId });
    if (!ready) return;
    const send: Sender =
      sender ||
      (async (payload, key) => {
        const resend = new Resend(process.env.RESEND_API_KEY);
        return resend.emails.send(payload, { idempotencyKey: key });
      });
    const result = await send(payload, `application/${applicationId}/${kind}`);
    if (result.error || !result.data) throw new Error("EmailDeliveryFailed");
    await db()
      .update(table)
      .set({
        state: "sent",
        sentAt: new Date(),
        providerId: result.data.id,
        errorCode: null,
      })
      .where(ownedBy(now));
  } catch {
    // No names, emails, credentials, payloads or provider errors in logs.
    console.error(
      `Application ${kind} email delivery failed. Retry from the admin dashboard.`,
    );
    try {
      if (!ownedAttempt) return;
      await db()
        .update(table)
        .set({ state: "failed", errorCode: "delivery_failed" })
        .where(ownedBy(ownedAttempt));
    } catch {
      /* a later retry can recover the expired sending lease */
    }
  }
}
