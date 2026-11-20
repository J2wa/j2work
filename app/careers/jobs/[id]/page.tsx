import { JobHeaderImage } from "@/components/job-header-image";
import { RoleHourlyRates } from "@/components/hourly-rates";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
import { formatLocation, formatRoleLabel } from "@/lib/role-display";
import { ApplyButton } from "@/components/apply-button";
import { ApplyForm } from "@/components/apply-form";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const applicant = session?.user;
  const [job, application] = await Promise.all([
    db().query.jobs.findFirst({
      where: and(eq(jobs.id, id), eq(jobs.isActive, true)),
    }),
    applicant
      ? db().query.applications.findFirst({
          where: and(
            eq(applications.jobId, id),
            eq(applications.applicantId, applicant.id),
          ),
        })
      : Promise.resolve(undefined),
  ]);
  if (!job) notFound();
  return (
    <>
      <Link className="text-link role-back" href="/careers">
        <ArrowLeft size={16} /> Open roles
      </Link>
      <div className="role-layout">
        <article>
          <JobHeaderImage url={job.headerImageUrl} />
          <p className="role-department">{formatRoleLabel(job.department)}</p>
          <h1 className="role-title">{job.title}</h1>
          <RoleHourlyRates job={job} />
          <div className="job-meta role-meta">
            <span>{formatLocation(job.location, job.remote)}</span>
            <span>{formatRoleLabel(job.roleType)}</span>
            {formatRoleLabel(job.workSetting) !==
              formatRoleLabel(job.roleType) && (
              <span>{formatRoleLabel(job.workSetting)}</span>
            )}
          </div>
          <div className="role-copy">
            <h2>About the role</h2>
            <p className="whitespace-pre-line">{job.description}</p>
            <h2>Requirements</h2>
            <ul>
              {job.requirements
                .split("\n")
                .filter(Boolean)
                .map((r, i) => (
                  <li key={i}>{r.replace(/^[-•]\s*/, "")}</li>
                ))}
            </ul>
          </div>
        </article>
        {applicant?.resumeUrl ? (
          <ApplyForm
            jobId={id}
            applied={Boolean(application)}
            resumeName={applicant.resumeName || "Your saved resume"}
          />
        ) : (
          <aside className="apply-panel apply-panel-guest">
            <h2>Apply for this role</h2>
            <p>
              {applicant
                ? "Upload your resume to apply with your saved profile."
                : "Log in or create a profile to apply."}
            </p>
            <div className="apply-action">
              <ApplyButton
                jobId={id}
                title={job.title}
                applied={Boolean(application)}
                signedIn={Boolean(applicant)}
                resumeReady={false}
              />
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
