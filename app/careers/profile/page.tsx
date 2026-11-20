import { requireApplicant } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
export const metadata = { title: "My profile" };
export default async function Page() {
  const applicant = await requireApplicant();
  return (
    <>
      <div className="portal-welcome">
        <div>
          <h1>My profile</h1>
        </div>
      </div>
      <ProfileForm
        profile={{
          id: applicant.id,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone || "",
          preferredWorkSetting: applicant.preferredWorkSetting,
          referredBy: applicant.referredBy || "",
          talentPoolOptIn: applicant.talentPoolOptIn || false,
          resumeName: applicant.resumeName,
        }}
      />
    </>
  );
}
