import Link from "next/link";
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
        <Heading>
          <Link href={`/careers/jobs/${job.id}`}>{job.title}</Link>
        </Heading>
        <div className="job-meta">
          <span>{formatRoleLabel(job.department)}</span>
          <span>{formatLocation(job.location, job.remote)}</span>
          <span>{roleType}</span>
          {workSetting !== roleType && <span>{workSetting}</span>}
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
