import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowUpRight, Files } from "lucide-react";
import { requireApplicant } from "@/lib/auth";
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
const labels: Record<string, string> = {
  submitted: "Submitted",
  reviewing: "Under review",
  shortlisted: "Shortlisted",
  hired: "Hired",
  not_selected: "Not selected",
};
export const metadata = { title: "My applications" };
export default async function Page() {
  const applicant = await requireApplicant();
  const rows = await db()
    .select({
      id: applications.id,
      jobId: jobs.id,
      title: jobs.title,
      department: jobs.department,
      status: applications.status,
      date: applications.submittedAt,
      note: applications.coverNote,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .where(eq(applications.applicantId, applicant.id))
    .orderBy(desc(applications.submittedAt));
  return (
    <>
      <div className="portal-welcome">
        <div>
          <div className="eyebrow">EVERY STEP FORWARD</div>
          <h1>My applications.</h1>
          <p>Your opportunities, all in one place.</p>
        </div>
        <Link href="/careers" className="button secondary">
          Explore roles <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="stats-row">
        <div>
          <strong>{rows.length}</strong>
          <span>Total applications</span>
        </div>
        <div>
          <strong>{rows.filter((a) => a.status === "reviewing").length}</strong>
          <span>Under review</span>
        </div>
        <div>
          <strong>
            {rows.filter((a) => a.status === "shortlisted").length}
          </strong>
          <span>Shortlisted</span>
        </div>
      </div>
      {rows.length ? (
        <div className="application-list">
          {rows.map((a) => (
            <article key={a.id}>
              <div>
                <div className="eyebrow">{a.department}</div>
                <h2>
                  <Link href={`/careers/jobs/${a.jobId}`}>{a.title}</Link>
                </h2>
                <p>
                  Applied{" "}
                  {a.date.toLocaleDateString("en-PH", {
                    dateStyle: "medium",
                    timeZone: "Asia/Manila",
                  })}
                </p>
                {a.note ? (
                  <details>
                    <summary>Your cover note</summary>
                    <p className="whitespace-pre-wrap">{a.note}</p>
                  </details>
                ) : null}
              </div>
              <div className="flex items-center gap-5">
                <span className={`status-badge ${a.status}`}>
                  {labels[a.status]}
                </span>
                <Link
                  aria-label={`View ${a.title}`}
                  href={`/careers/jobs/${a.jobId}`}
                >
                  <ArrowUpRight size={21} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Files size={25} />
          </div>
          <h3>Your story starts with an application.</h3>
          <p>
            When you apply for a role, you’ll see it here along with its latest
            status.
          </p>
          <Link href="/careers" className="button">
            Explore opportunities <ArrowUpRight size={17} />
          </Link>
        </div>
      )}
    </>
  );
}
