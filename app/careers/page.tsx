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
      <div className="careers-header">
        <div>
          <span className="eyebrow">Careers at ACES</span>
          <h1 className="careers-heading">Open roles</h1>
          <p className="careers-subtitle">
            Find your next role in data annotation, model evaluation, quality
            assurance, or engineering.
          </p>
        </div>
        <span className="count-pill">{roles.length} open</span>
      </div>
      <JobBoard
        jobs={roles}
        appliedIds={submitted.map((a) => a.jobId)}
        signedIn={Boolean(session)}
        resumeReady={Boolean(session?.user.resumeUrl)}
      />
    </>
  );
}
