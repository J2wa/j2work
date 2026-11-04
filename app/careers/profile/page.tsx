import { requireApplicant } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
export const metadata = { title: "My profile" };
export default async function Page() {
  const applicant = await requireApplicant();
  return (
    <>
      <div className="portal-welcome">
        <div>
          <div className="eyebrow">YOUR STORY, YOUR WAY</div>
          <h1>My profile.</h1>
          <p>Keep your details ready for your next opportunity.</p>
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
