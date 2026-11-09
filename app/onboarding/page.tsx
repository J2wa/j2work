import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { ResumeForm } from "@/components/profile-form";
import { requireApplicant } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const applicant = await requireApplicant(false);
  const next = (await searchParams).next;
  const destination = next?.startsWith("/careers/jobs/") && !next.includes("\\") && !next.includes("?") && !next.includes("#") ? next : "/careers";
  if (applicant.resumeUrl) redirect(destination);
  return (
    <AuthShell>
      <div className="eyebrow">ONE LAST STEP</div>
      <h2>Bring your experience.</h2>
      <p className="panel-intro">
        Your account is saved, {applicant.name.split(" ")[0]}. Upload your
        resume to finish your profile and explore opportunities.
      </p>
      <ResumeForm userId={applicant.id} onboarding />
    </AuthShell>
  );
}
