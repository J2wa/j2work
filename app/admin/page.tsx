import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
import { emailConfiguration } from "@/lib/email";
export default async function Page() {
  await requireAdmin();
  const [groups, active] = await Promise.all([
    db()
      .select({ status: applications.status, total: count() })
      .from(applications)
      .groupBy(applications.status),
    db().select({ total: count() }).from(jobs).where(eq(jobs.isActive, true)),
  ]);
  const totals = Object.fromEntries(groups.map((g) => [g.status, g.total]));
  const stats = [
    ["Total applications", groups.reduce((n, g) => n + g.total, 0)],
    ["Awaiting review", totals.submitted || 0],
    ["Shortlisted", totals.shortlisted || 0],
    ["Hired", totals.hired || 0],
    ["Active openings", active[0].total],
  ];
  return (
    <>
      <div className="portal-welcome">
        <div>
          <div className="eyebrow">RECRUITMENT</div>
          <h1>Dashboard</h1>
          <p>Manage applications and opportunities in one place.</p>
        </div>
        <Link href="/admin/jobs" className="button">
          Manage jobs
        </Link>
      </div>
      <div className="admin-stats">
        {stats.map(([label, value]) => (
          <div className="panel" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Application notifications</h2>
        <p className="mt-3 text-muted">
          {emailConfiguration()
            ? "Recruitment email is configured. Check notification delivery and retry failures from Applications. Verify your sending domain in Resend before going live."
            : "Email setup is incomplete. Configure RESEND_API_KEY, RESEND_FROM_EMAIL and CAREERS_SITE_URL in Vercel. Applications are saved and notifications remain queued until email is configured."}
        </p>
        <p className="mt-3 text-muted">
          This release emails the recruitment team for new applications.
          Applicants can track status in their account; applicant confirmation
          and status emails are not enabled.
        </p>
        <Link className="text-link mt-5" href="/admin/applications">
          Review applications →
        </Link>
      </div>
    </>
  );
}
