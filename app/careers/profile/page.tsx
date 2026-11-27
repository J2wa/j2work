import { eq } from "drizzle-orm";
import { requireApplicant } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { parseInterestedRoles } from "@/lib/role-catalog";
import { ProfileForm } from "@/components/profile-form";

export const metadata = { title: "My profile" };

export default async function Page() {
  const [applicant, activeJobs] = await Promise.all([
    requireApplicant(),
    db().select({ title: jobs.title }).from(jobs).where(eq(jobs.isActive, true)),
  ]);
  return (
    <>
      <div className="portal-welcome">
        <div>
          <span className="eyebrow">Applicant Portal</span>
          <h1>My profile</h1>
          <p>
            Keep your contact details, job interests, and saved resume up to
            date for one-click applications.
          </p>
        </div>
      </div>
      <ProfileForm
        availableRoles={activeJobs.map((j) => j.title)}
        profile={{
          id: applicant.id,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone || "",
          preferredWorkSetting: applicant.preferredWorkSetting,
          referredBy: applicant.referredBy || "",
          talentPoolOptIn: applicant.talentPoolOptIn || false,
          interestedRoles: parseInterestedRoles(applicant.interestedRoles),
          resumeName: applicant.resumeName,
        }}
      />
    </>
  );
}
