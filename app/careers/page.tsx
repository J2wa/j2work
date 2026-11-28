import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobs, applications } from "@/lib/db/schema";
import { JobBoard } from "@/components/job-board";
import { SetupNotice } from "@/components/setup-notice";

export const metadata = { title: "Open roles" };

export default async function Page() {
  if (!process.env.TURSO_DATABASE_URL) return <SetupNotice />;
  const session = await getSession();
  const [roles, submitted] = await Promise.all([
    db()
      .select()
      .from(jobs)
      .where(eq(jobs.isActive, true))
      .orderBy(desc(jobs.createdAt)),
    session
      ? db()
          .select({ jobId: applications.jobId })
          .from(applications)
          .where(eq(applications.applicantId, session.user.id))
      : Promise.resolve([]),
  ]);
  return (
    <>
      <section
        className="careers-banner"
        data-hero-glow=""
        data-reveal=""
        aria-labelledby="open-roles-heading"
      >
        <div className="careers-banner-copy">
          <span className="eyebrow">ACES Ecosystem · ACES Careers</span>
          <h1 id="open-roles-heading" className="careers-heading">
            Open <span className="accent-serif">roles.</span>
          </h1>
          <p className="careers-subtitle">
            Browse active remote roles in data annotation, model evaluation,
            quality assurance, and engineering—all with transparent hourly
            rates.
          </p>
        </div>
        <div className="careers-banner-side">
          <span className="count-pill">
            <span className="count-pill-dot" aria-hidden="true" />
            {roles.length} open {roles.length === 1 ? "role" : "roles"}
          </span>
          <Link href="/#specialist-pool" className="text-link">
            Don’t see your field? Join the specialist pool{" "}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <JobBoard
        jobs={roles}
        appliedIds={submitted.map((a) => a.jobId)}
        signedIn={Boolean(session)}
        resumeReady={Boolean(session?.user.resumeUrl)}
      />
    </>
  );
}
