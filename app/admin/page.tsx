import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { db } from "@/lib/db";
import { jobs, applications, user, applicationEmails } from "@/lib/db/schema";
import { Brand, Footer } from "@/components/brand";
import { AdminProjects } from "@/components/admin-projects";
import { ApplicationActions } from "@/components/admin-application-actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Hiring dashboard",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!isAdminId(session.user.id))
    return (
      <>
        <header className="site-header">
          <div className="shell">
            <Brand />
          </div>
        </header>
        <main className="shell section-space">
          <h1>Administrator access required</h1>
          <p>
            Your account is signed in, but has not been approved for hiring
            access.
          </p>
          <p>
            Account ID: <code>{session.user.id}</code>
          </p>
          <p>Ask the site owner to add this ID to ADMIN_USER_IDS in Vercel.</p>
          <Link className="text-link" href="/">
            Return home
          </Link>
        </main>
      </>
    );
  const [projects, entries] = await Promise.all([
    db().select().from(jobs).orderBy(desc(jobs.createdAt)),
    db()
      .select({
        id: applications.id,
        name: user.name,
        email: user.email,
        title: jobs.title,
        status: applications.status,
        note: applications.coverNote,
        submittedAt: applications.submittedAt,
        emailId: applicationEmails.applicationId,
        sentAt: applicationEmails.sentAt,
        emailError: applicationEmails.error,
      })
      .from(applications)
      .innerJoin(user, eq(applications.applicantId, user.id))
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(
        applicationEmails,
        eq(applications.id, applicationEmails.applicationId),
      )
      .orderBy(desc(applications.submittedAt))
      .limit(200),
  ]);
  return (
    <>
      <header className="site-header">
        <div className="shell flex justify-between items-center">
          <Brand />
          <Link href="/" className="text-link">
            View website ↗
          </Link>
        </div>
      </header>
      <main id="main" className="shell section-space">
        <div className="eyebrow">ACES / HIRING WORKSPACE</div>
        <div className="section-heading">
          <div>
            <h1>Your next team starts here.</h1>
            <p>Manage projects and meet the people behind every application.</p>
          </div>
          <span className="project-status live">Admin access</span>
        </div>
        <div className="admin-stats">
          <div>
            <strong>{projects.filter((p) => p.isActive).length}</strong>
            <span>Published projects</span>
          </div>
          <div>
            <strong>{projects.filter((p) => !p.isActive).length}</strong>
            <span>Draft / closed projects</span>
          </div>
          <div>
            <strong>
              {entries.length}
              {entries.length === 200 ? "+" : ""}
            </strong>
            <span>Recent applications</span>
          </div>
        </div>
        {!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL ? (
          <p className="admin-notice">
            Email delivery needs setup. Connect Resend and set RESEND_FROM_EMAIL
            in Vercel. Applications are saved and notifications can be retried
            below.
          </p>
        ) : null}
        <AdminProjects projects={projects} />
        <section className="section-space">
          <div className="section-heading">
            <h2>Applicant inbox</h2>
            <span>Latest 200 applications</span>
          </div>
          {!entries.length && (
            <p className="admin-empty">
              Applications will appear here when candidates apply.
            </p>
          )}
          {entries.map((a) => (
            <article className="admin-application" key={a.id}>
              <div>
                <h3>{a.name}</h3>
                <a className="text-link" href={`mailto:${a.email}`}>
                  {a.email}
                </a>
                <p>
                  {a.title} ·{" "}
                  {a.submittedAt.toLocaleDateString("en-PH", {
                    timeZone: "Asia/Manila",
                  })}
                </p>
                {a.note && <p className="application-note">{a.note}</p>}
                <a
                  className="text-link"
                  href={`/api/admin/resume?id=${encodeURIComponent(a.id)}`}
                >
                  Download submitted resume ↗
                </a>
                <p className="field-help">
                  Email:{" "}
                  {a.sentAt
                    ? "Accepted by Resend"
                    : a.emailId
                      ? a.emailError || "Pending"
                      : "Legacy application — no notification queued"}
                </p>
              </div>
              <ApplicationActions
                id={a.id}
                status={a.status}
                pendingEmail={!!a.emailId && !a.sentAt}
              />
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
