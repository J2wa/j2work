import { and, count, desc, eq, like, or } from "drizzle-orm";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { domainSpecialists } from "@/lib/db/schema";
import { SPECIALIST_DOMAINS } from "@/lib/role-catalog";
import { formatRoleLabel } from "@/lib/role-display";

export const metadata = { title: "Specialist talent pool" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; domain?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q || "").slice(0, 120).trim();
  const domain = SPECIALIST_DOMAINS.find((d) => d === params.domain);

  const where = and(
    domain ? eq(domainSpecialists.primaryDomain, domain) : undefined,
    q
      ? or(
          like(domainSpecialists.fullName, `%${q}%`),
          like(domainSpecialists.email, `%${q}%`),
          like(domainSpecialists.specialtyDetails, `%${q}%`),
        )
      : undefined,
  );

  const [rows, total] = await Promise.all([
    db()
      .select()
      .from(domainSpecialists)
      .where(where)
      .orderBy(desc(domainSpecialists.updatedAt))
      .limit(100),
    db().select({ total: count() }).from(domainSpecialists).where(where),
  ]);

  return (
    <>
      <div className="portal-welcome">
        <div>
          <span className="eyebrow">Recruitment</span>
          <h1>Specialist talent pool</h1>
          <p>
            {total[0].total} registered domain{" "}
            {total[0].total === 1 ? "specialist" : "specialists"} · Dates shown
            in Manila time
          </p>
        </div>
      </div>

      <form className="admin-filters" action="/admin/specialists">
        <label className="field">
          Search name, email, or specialty
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, email, license, or skill"
          />
        </label>
        <label className="field">
          Domain
          <select name="domain" defaultValue={domain || ""}>
            <option value="">All domains</option>
            {SPECIALIST_DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <button className="button">Search</button>
        <Link className="text-link" href="/admin/specialists">
          Clear
        </Link>
      </form>

      {rows.length ? (
        <div className="admin-table">
          <table>
            <caption className="sr-only">
              Domain specialist talent pool entries
            </caption>
            <thead>
              <tr>
                {["Specialist", "Domain & specialty", "Experience", "Notes"].map(
                  (h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td data-label="Specialist">
                    <strong>{s.fullName}</strong>
                    <span>{s.email}</span>
                    {s.portfolioUrl && (
                      <a
                        className="text-link mt-1"
                        href={s.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Profile link <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    )}
                  </td>
                  <td data-label="Domain & specialty">
                    <span className="status-badge">{s.primaryDomain}</span>
                    <strong className="mt-2">{s.specialtyDetails}</strong>
                    {s.highestCredential && <span>{s.highestCredential}</span>}
                  </td>
                  <td data-label="Experience">
                    <strong>{s.yearsExperience}</strong>
                    <span>{formatRoleLabel(s.preferredWorkSetting)}</span>
                    <span>
                      {s.updatedAt.toLocaleDateString("en-PH", {
                        dateStyle: "medium",
                        timeZone: "Asia/Manila",
                      })}
                    </span>
                  </td>
                  <td data-label="Notes">
                    <span>{s.availabilityNotes || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h2>No specialists found</h2>
          <p>
            Domain specialists who submit the talent pool form on the careers
            home page will appear here.
          </p>
        </div>
      )}
    </>
  );
}
