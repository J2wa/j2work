import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, MapPin, BriefcaseBusiness, Clock3 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
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
      <Link className="text-link text-sm mb-8" href="/careers">
        <ArrowLeft size={16} /> All opportunities
      </Link>
      <div className="role-layout">
        <article>
          <div className="eyebrow text-accent">{job.department}</div>
          <h1 className="role-title">{job.title}</h1>
          <div className="job-meta role-meta">
            <span>
              <MapPin size={16} />
              {job.remote ? "Remote · " : ""}
              {job.location}
            </span>
            <span>
              <BriefcaseBusiness size={16} />
              {job.roleType}
            </span>
            <span>
              <Clock3 size={16} />
              {job.workSetting}
            </span>
          </div>
          {!job.isActive ? (
            <p className="notice">
              This role is no longer accepting applications.
            </p>
          ) : null}
          <div className="role-copy">
            <h2>About the opportunity</h2>
            <p className="whitespace-pre-line">{job.description}</p>
            <h2>What you’ll bring</h2>
            <ul>
              {job.requirements
                .split("\n")
                .filter(Boolean)
                .map((r, i) => (
                  <li key={i}>{r.replace(/^[-•]\s*/, "")}</li>
                ))}
            </ul>
            <h2>A place for your perspective</h2>
            <p>
              ACES Intelligence brings human expertise to AI through data
              annotation, model evaluation, quality assurance, and intelligent
              automation. We value careful work, clear communication, and a
              willingness to learn.
            </p>
          </div>
        </article>
        {applicant?.resumeUrl ? (
          <ApplyForm
            jobId={id}
            applied={Boolean(application)}
            resumeName={applicant.resumeName || "Your saved resume"}
          />
        ) : (
          <aside className="apply-panel">
            <h2>Apply for this role</h2>
            <p>
              Sign in and upload your resume to apply with your saved profile.
            </p>
            <Link
              href={applicant ? "/onboarding" : "/login"}
              className="button"
            >
              {applicant ? "Upload resume" : "Log in to apply"}
            </Link>
          </aside>
        )}
      </div>
    </>
  );
}
