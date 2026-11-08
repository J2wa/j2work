import { and, desc, eq, like, or, count } from "drizzle-orm";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { applications, jobs, user, applicationEmails } from "@/lib/db/schema";
import { applicationStatuses, statusLabels } from "@/lib/validation";
import { ApplicationActions } from "@/components/admin-applications";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    id?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q || "").slice(0, 120);
  const status = applicationStatuses.find((s) => s === params.status);
  const page = Math.max(
    1,
    Math.min(100000, Number.parseInt(params.page || "1") || 1),
  );
  const where = and(
    status ? eq(applications.status, status) : undefined,
    params.id ? eq(applications.id, params.id) : undefined,
    q
      ? or(
          like(user.name, `%${q}%`),
          like(user.email, `%${q}%`),
          like(jobs.title, `%${q}%`),
        )
      : undefined,
  );
  const [rows, total] = await Promise.all([
    db()
      .select({
        id: applications.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        title: jobs.title,
        submittedAt: applications.submittedAt,
        status: applications.status,
        note: applications.coverNote,
        delivery: applicationEmails.state,
        emailError: applicationEmails.errorCode,
      })
      .from(applications)
      .innerJoin(user, eq(user.id, applications.applicantId))
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .leftJoin(
        applicationEmails,
        eq(applicationEmails.applicationId, applications.id),
      )
      .where(where)
      .orderBy(desc(applications.submittedAt), applications.id)
      .limit(25)
      .offset((page - 1) * 25),
    db()
      .select({ total: count() })
      .from(applications)
      .innerJoin(user, eq(user.id, applications.applicantId))
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .where(where),
  ]);
  const pageUrl = (n: number) =>
    `/admin/applications?${new URLSearchParams({ q, status: status || "", page: String(n), ...(params.id ? { id: params.id } : {}) })}`;
  return (
    <>
      <div className="portal-welcome">
        <div>
          <h1>Applications</h1>
          <p>
            {total[0].total} matching applications · Dates shown in Manila time
          </p>
        </div>
      </div>
      <form className="admin-filters" action="/admin/applications">
        <label className="field">
          Search applicants or jobs
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, email or job title"
          />
        </label>
        <label className="field">
          Status
          <select name="status" defaultValue={status || ""}>
            <option value="">All statuses</option>
            {applicationStatuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <button className="button">Search</button>
        <Link className="text-link" href="/admin/applications">
          Clear
        </Link>
      </form>
      {rows.length ? (
        <div className="admin-table">
          <table>
            <caption className="sr-only">Recruitment applications</caption>
            <thead>
              <tr>
                {["Applicant", "Job / resume", "Date", "Status / actions"].map(
                  (h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td data-label="Applicant">
                    <strong>{a.name}</strong>
                    <span>{a.email}</span>
                    {a.phone && <span>{a.phone}</span>}
                  </td>
                  <td data-label="Job / resume">
                    <strong>{a.title}</strong>
                    <a
                      className="text-link mt-3"
                      href={`/api/admin/applications/${a.id}/resume`}
                    >
                      Download submitted resume
                    </a>
                    {a.note && (
                      <details className="mt-3">
                        <summary>Cover note</summary>
                        <p className="whitespace-pre-wrap">{a.note}</p>
                      </details>
                    )}
                  </td>
                  <td data-label="Date">
                    {a.submittedAt.toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Manila",
                    })}
                  </td>
                  <td data-label="Status / actions">
                    <ApplicationActions
                      id={a.id}
                      status={a.status}
                      delivery={a.delivery}
                      emailError={a.emailError}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h2>No applications found</h2>
          <p>Try another search or status filter.</p>
        </div>
      )}
      <nav aria-label="Application pages" className="pagination">
        {page > 1 && (
          <Link className="button secondary small" href={pageUrl(page - 1)}>
            Previous
          </Link>
        )}
        <span>Page {page}</span>
        {page * 25 < total[0].total && (
          <Link className="button secondary small" href={pageUrl(page + 1)}>
            Next
          </Link>
        )}
      </nav>
    </>
  );
}
