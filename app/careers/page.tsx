import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { requireApplicant } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobs, applications } from "@/lib/db/schema";
import { JobBoard } from "@/components/job-board";
export const metadata = { title: "Opportunities" };
export default async function Page() {
  const applicant = await requireApplicant();
  const [roles, submitted] = await Promise.all([
    db()
      .select()
      .from(jobs)
      .where(eq(jobs.isActive, true))
      .orderBy(desc(jobs.createdAt)),
    db()
      .select({ jobId: applications.jobId })
      .from(applications)
      .where(eq(applications.applicantId, applicant.id)),
  ]);
  return (
    <>
      <div className="portal-welcome">
        <div>
          <div className="eyebrow">YOUR NEXT CHAPTER</div>
          <h1>Find work that moves you.</h1>
          <p>
            Hi {applicant.name.split(" ")[0]}. Let’s find a place for your
            expertise.
          </p>
        </div>
        <Link href="/careers/profile" className="profile-ready">
          <CheckCircle2 size={19} />
          <div>
            <strong>Your profile is ready</strong>
            <small>Review or update your details</small>
          </div>
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <JobBoard jobs={roles} appliedIds={submitted.map((a) => a.jobId)} />
      <aside className="portal-note">
        <div>
          <span className="eyebrow">GROW WITH US</span>
          <h3>Make room for what’s next.</h3>
          <p>
            Stay connected to future projects and opportunities through our
            talent pool.
          </p>
        </div>
        <Link href="/careers/profile" className="text-link">
          Manage preferences <ArrowUpRight size={17} />
        </Link>
      </aside>
    </>
  );
}
