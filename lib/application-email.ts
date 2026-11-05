import { eq } from "drizzle-orm";
import { db } from "./db";
import { applicationEmails } from "./db/schema";
export function applicationEmailPayload(input: {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  note: string;
}) {
  return JSON.stringify({
    to: ["acesintelligenceph@gmail.com"],
    reply_to: input.email,
    subject: `Applying for ${input.title.replace(/[\r\n]/g, " ")}`,
    text: [
      `New application: ${input.id}`,
      `Project: ${input.title}`,
      `Applicant: ${input.name}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone || "Not provided"}`,
      "",
      input.note || "No cover note provided.",
      "",
      "Review this application and download the private resume in the admin dashboard:",
      `${process.env.BETTER_AUTH_URL || "https://careers.acesintelligence.xyz"}/admin`,
    ].join("\n"),
  });
}
export async function sendApplicationEmail(id: string) {
  const row = await db().query.applicationEmails.findFirst({
    where: eq(applicationEmails.applicationId, id),
  });
  if (!row || row.sentAt) return;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  try {
    if (!key || !from) throw new Error("Email setup incomplete");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `application/${id}`,
      },
      body: JSON.stringify({ ...JSON.parse(row.payload), from }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Error(`Email provider returned ${response.status}`);
    await db()
      .update(applicationEmails)
      .set({ sentAt: new Date(), lastAttemptAt: new Date(), error: null })
      .where(eq(applicationEmails.applicationId, id));
  } catch (e) {
    // Keep the application even if delivery fails; admins can retry pending notifications.
    const error =
      e instanceof Error &&
      (e.message === "Email setup incomplete" ||
        e.message.startsWith("Email provider returned"))
        ? e.message
        : "Email delivery could not be confirmed";
    await db()
      .update(applicationEmails)
      .set({ lastAttemptAt: new Date(), error })
      .where(eq(applicationEmails.applicationId, id));
  }
}
