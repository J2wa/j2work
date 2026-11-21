import Link from "next/link";
import { Suspense } from "react";
import { PublicHeader, Footer } from "@/components/brand";
import { eq, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs, applications } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { RoleRow } from "@/components/role-row";
import { RoleRowsSkeleton } from "@/components/role-rows-skeleton";

export const dynamic = "force-dynamic";

async function HomeRoles() {
  const [session, roles, totals] = process.env.TURSO_DATABASE_URL
    ? await Promise.all([
        getSession(),
        db()
          .select()
          .from(jobs)
          .where(eq(jobs.isActive, true))
          .orderBy(desc(jobs.createdAt))
          .limit(6),
        db()
          .select({ total: count() })
          .from(jobs)
          .where(eq(jobs.isActive, true)),
      ])
    : [null, [], []];
  const submitted = session
    ? await db()
        .select({ jobId: applications.jobId })
        .from(applications)
        .where(eq(applications.applicantId, session.user.id))
    : [];
  const appliedIds = new Set(submitted.map(({ jobId }) => jobId));

  return (
    <>
      <p className="home-role-count">{totals[0]?.total ?? 0} open</p>
      {roles.length > 0 ? (
        <ul className="role-list" role="list">
          {roles.map((job) => (
            <RoleRow
              key={job.id}
              job={job}
              heading="h3"
              applied={appliedIds.has(job.id)}
              signedIn={Boolean(session)}
              resumeReady={Boolean(session?.user.resumeUrl)}
            />
          ))}
        </ul>
      ) : (
        <p className="empty-roles">No open roles right now.</p>
      )}
      <Link className="text-link all-roles" href="/careers">
        View all roles
      </Link>
    </>
  );
}

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main">
        <section className="home-hero">
          <div className="shell home-intro">
            <h1>Remote work that makes AI better</h1>
            <p>
              ACES Intelligence hires people for data annotation, model
              evaluation, quality assurance and engineering. Create a profile
              once, then apply to any role with your saved resume.
            </p>
            <div className="home-actions">
              <Link href="#open-roles" className="button">
                See open roles
              </Link>
              <Link href="/signup" className="text-link">
                Create profile
              </Link>
            </div>
          </div>
          <svg
            className="hero-bars"
            viewBox="0 0 368 320"
            preserveAspectRatio="xMaxYMid slice"
            aria-hidden="true"
          >
            <g transform="translate(130 0) skewX(-27)">
              <rect width="76" height="320" fill="var(--primary)" />
              <rect x="104" width="76" height="320" fill="var(--line)" />
              <rect x="208" width="76" height="320" fill="var(--ink)" />
            </g>
          </svg>
        </section>
        <div className="home-content">
          <section className="shell home-roles" aria-labelledby="open-roles">
            <h2 id="open-roles">Open roles</h2>
            <Suspense fallback={<RoleRowsSkeleton />}>
              <HomeRoles />
            </Suspense>
          </section>
          <section
            className="shell landing-steps"
            aria-labelledby="how-to-apply"
          >
            <h2 id="how-to-apply">How to apply</h2>
            <ol className="steps-strip">
              <li>Create profile</li>
              <li>Choose a role</li>
              <li>Track your application</li>
            </ol>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
