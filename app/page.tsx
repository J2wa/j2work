import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
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
  const totalOpen = totals[0]?.total ?? 0;

  return (
    <>
      <div className="section-header">
        <div>
          <span className="eyebrow">Now Hiring</span>
          <h2 id="open-roles">Open roles</h2>
          <p className="section-subtitle">
            Explore current remote opportunities across annotation, evaluation,
            QA, and engineering.
          </p>
        </div>
        <span className="count-pill">{totalOpen} open</span>
      </div>
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
      <div className="all-roles-bar">
        <Link className="text-link" href="/careers">
          View all roles <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}

const steps = [
  {
    number: "01",
    title: "Create your profile once",
    description:
      "Add your contact details, work preference, and upload your PDF or DOCX resume privately.",
  },
  {
    number: "02",
    title: "Apply in a single click",
    description:
      "Browse open roles with clear hourly rates and submit using your saved resume—no repetitive forms.",
  },
  {
    number: "03",
    title: "Track every stage",
    description:
      "Follow your application status from submission to shortlisting directly in your applicant portal.",
  },
];

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main">
        <section className="home-hero">
          <div className="shell home-hero-grid">
            <div className="home-intro">
              <span className="eyebrow home-eyebrow">ACES Intelligence</span>
              <h1>Remote work that makes AI better</h1>
              <p className="home-lead">
                ACES Intelligence hires people for data annotation, model
                evaluation, quality assurance, and engineering. Create a profile
                once, then apply to any role with your saved resume.
              </p>
              <div className="home-actions">
                <Link href="#open-roles" className="button">
                  See open roles <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href="/signup" className="button secondary">
                  Create profile
                </Link>
              </div>
              <ul className="home-proof" aria-label="Portal highlights">
                <li>Remote-first roles</li>
                <li>Transparent hourly pay</li>
                <li>One saved resume</li>
              </ul>
            </div>
            <div className="hero-visual">
              <div className="hero-photo-frame">
                <Image
                  src="/hero-workspace.jpg"
                  alt="An ACES Intelligence specialist reviewing AI evaluation work on a laptop in a sunlit workspace"
                  width={1200}
                  height={900}
                  priority
                  sizes="(max-width: 960px) 100vw, 45vw"
                />
              </div>
              <svg
                className="hero-accent-shape"
                viewBox="0 0 148 148"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M28 148L116 0H148L60 148H28Z"
                  fill="var(--primary-soft)"
                />
                <path
                  d="M84 148L148 40V104L122 148H84Z"
                  fill="var(--primary)"
                  fillOpacity="0.14"
                />
              </svg>
            </div>
          </div>
        </section>

        <div className="home-content">
          <section className="shell home-roles" aria-labelledby="open-roles">
            <Suspense
              fallback={
                <>
                  <div className="section-header">
                    <div>
                      <span className="eyebrow">Now Hiring</span>
                      <h2 id="open-roles">Open roles</h2>
                    </div>
                  </div>
                  <RoleRowsSkeleton />
                </>
              }
            >
              <HomeRoles />
            </Suspense>
          </section>

          <section
            className="landing-steps-band"
            aria-labelledby="how-to-apply"
          >
            <div className="shell">
              <div className="section-header">
                <div>
                  <span className="eyebrow">Simple Process</span>
                  <h2 id="how-to-apply">How to apply</h2>
                </div>
              </div>
              <ol className="steps-strip">
                {steps.map((step) => (
                  <li className="step-card" key={step.number}>
                    <span className="step-num">{step.number}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
