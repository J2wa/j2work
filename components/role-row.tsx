import Link from "next/link";
import { MapPin, Briefcase, Clock } from "lucide-react";
import type { Job } from "@/lib/db/schema";
import { formatLocation, formatRoleLabel } from "@/lib/role-display";
import { ApplyButton } from "./apply-button";
import { RoleHourlyRates } from "./hourly-rates";

export function RoleRow({
  job,
  heading: Heading,
  applied,
  signedIn,
  resumeReady,
}: {
  job: Job;
  heading: "h2" | "h3";
  applied: boolean;
  signedIn: boolean;
  resumeReady: boolean;
}) {
  const roleType = formatRoleLabel(job.roleType);
  const workSetting = formatRoleLabel(job.workSetting);
  return (
    <li className="role-row">
      <div className="role-row-details">
        <span className="role-row-dept">{formatRoleLabel(job.department)}</span>
        <Heading>
          <Link href={`/careers/jobs/${job.id}`}>{job.title}</Link>
        </Heading>
        {job.summary ? <p className="role-summary">{job.summary}</p> : null}
        <div className="job-meta">
          <span>
            <MapPin size={14} aria-hidden="true" />
            {formatLocation(job.location, job.remote)}
          </span>
          <span>
            <Briefcase size={14} aria-hidden="true" />
            {roleType}
          </span>
          {workSetting !== roleType && (
            <span>
              <Clock size={14} aria-hidden="true" />
              {workSetting}
            </span>
          )}
        </div>
      </div>
      <RoleHourlyRates job={job} />
      <ApplyButton
        jobId={job.id}
        title={job.title}
        applied={applied}
        signedIn={signedIn}
        resumeReady={resumeReady}
      />
    </li>
  );
}
