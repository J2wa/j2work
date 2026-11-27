import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { AcesLogoMark, PublicHeader, Footer } from "@/components/brand";
import { eq, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs, applications } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { RoleRow } from "@/components/role-row";
import { RoleRowsSkeleton } from "@/components/role-rows-skeleton";
import { SpecialistPoolForm } from "@/components/specialist-pool-form";

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
            Apply directly to active remote openings with transparent hourly
            rates.
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

const tracks = [
  {
    num: "01",
    title: "Data & Multimodal Annotation",
    copy: "Video, image, audio, and multilingual labeling built to clear project rubrics.",
    href: "/careers",
    cta: "Browse roles",
  },
  {
    num: "02",
    title: "Model Evaluation & RLHF",
    copy: "Side-by-side response grading, factuality checks, prompt craft, and AI safety testing.",
    href: "/careers",
    cta: "Browse roles",
  },
  {
    num: "03",
    title: "Quality & Operations",
    copy: "Reviewer calibration, edge-case triage, and smooth remote project delivery.",
    href: "/careers",
    cta: "Browse roles",
  },
  {
    num: "04",
    title: "Domain Specialists",
    copy: "Practicing doctors, engineers, lawyers, CPAs, and researchers guiding frontier AI.",
    href: "#specialist-pool",
    cta: "Join specialist pool",
  },
];

const specialistDomainsPreview = [
  "Medicine & Healthcare",
  "Software Engineering & CS",
  "Law & Compliance",
  "Finance & Accounting",
  "Math, Physics & Sciences",
  "Linguistics & Editorial",
];

const steps = [
  {
    number: "01",
    title: "Create your profile once",
    description:
      "Check every job track you’re open to, set your preferred schedule, and upload your PDF or DOCX resume privately.",
  },
  {
    number: "02",
    title: "Apply in a single click",
    description:
      "Browse open roles with clear PHP and USD hourly rates and submit instantly with your saved resume.",
  },
  {
    number: "03",
    title: "Track every stage",
    description:
      "Follow each application from submission to shortlisting directly inside your ACES applicant portal.",
  },
];

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main">
        {/* Hero */}
        <section className="home-hero">
          <div className="shell home-hero-grid">
            <div className="home-intro">
              <span className="eyebrow home-eyebrow">
                ACES Intelligence Careers
              </span>
              <h1>Remote work that makes AI better</h1>
              <p className="home-lead">
                Join ACES Intelligence across data annotation, model evaluation,
                quality assurance, and engineering—or register your field
                credentials in our Domain Specialist Talent Pool for upcoming
                expert AI projects.
              </p>
              <div className="home-actions">
                <Link href="#open-roles" className="button">
                  See open roles <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href="#specialist-pool" className="button secondary">
                  Join specialist pool
                </Link>
                <Link href="/signup" className="text-link">
                  Create profile
                </Link>
              </div>
              <ul className="home-proof" aria-label="Portal highlights">
                <li>Remote-first roles</li>
                <li>Transparent PHP &amp; USD hourly rates</li>
                <li>One reusable resume</li>
              </ul>
            </div>

            <div className="hero-visual">
              <div className="hero-brand-stage">
                <AcesLogoMark
                  size={240}
                  theme="light"
                  wordmark="show"
                  animate="none"
                  track="on"
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
                  fillOpacity="0.16"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Core Tracks Strip */}
        <section className="tracks-band" aria-label="Work tracks">
          <div className="shell">
            <div className="tracks-grid">
              {tracks.map((track) => (
                <Link
                  href={track.href}
                  key={track.num}
                  className="track-column"
                >
                  <span className="step-num">{track.num}</span>
                  <h2>{track.title}</h2>
                  <p>{track.copy}</p>
                  <span className="track-cta">
                    {track.cta} <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Open Roles */}
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
        </div>

        {/* Domain Specialist Talent Pool */}
        <section
          id="specialist-pool"
          className="specialist-band"
          aria-labelledby="specialist-heading"
        >
          <div className="shell specialist-grid">
            <div className="specialist-pitch">
              <div className="specialist-logo-wrap">
                <AcesLogoMark
                  size={136}
                  theme="dark"
                  wordmark="show"
                  animate="none"
                  track="on"
                />
              </div>
              <span className="specialist-eyebrow">
                Domain Specialist Talent Pool
              </span>
              <h2 id="specialist-heading">
                Bring your field expertise to frontier AI
              </h2>
              <p className="specialist-lead">
                Not seeing a live opening in your specialty yet? Join our vetted
                bench of subject-matter experts. We reach out to pool members
                first when new project-based and advisory AI evaluations launch.
              </p>

              <div className="specialist-domains-box">
                <h3>Fields we frequently recruit</h3>
                <ul className="specialist-domains-list">
                  {specialistDomainsPreview.map((domain) => (
                    <li key={domain}>{domain}</li>
                  ))}
                </ul>
              </div>

              <dl className="specialist-highlights">
                <div>
                  <dt>Flexible schedule</dt>
                  <dd>Remote project-based, part-time, or full-time options</dd>
                </div>
                <div>
                  <dt>Direct priority outreach</dt>
                  <dd>Matched to specialist projects before public listings</dd>
                </div>
              </dl>
            </div>

            <SpecialistPoolForm />
          </div>
        </section>

        {/* How to Apply */}
        <section className="landing-steps-band" aria-labelledby="how-to-apply">
          <div className="shell">
            <div className="section-header">
              <div>
                <span className="eyebrow">Simple Process</span>
                <h2 id="how-to-apply">How to apply</h2>
              </div>
              <Link href="/signup" className="button secondary small">
                Create profile <ArrowRight size={15} aria-hidden="true" />
              </Link>
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
      </main>
      <Footer />
    </>
  );
}
