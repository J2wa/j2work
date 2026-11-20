import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { ResumeForm } from "@/components/profile-form";
import { getSession } from "@/lib/auth";
import { safeReturnPath, withReturnPath } from "@/lib/return-path";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = safeReturnPath((await searchParams).next);
  const session = await getSession();
  if (!session) redirect(withReturnPath("/login", next));
  if (session.user.resumeUrl) redirect(next ?? "/careers");
  return (
    <AuthShell>
      <h1>Upload your resume</h1>
      <p className="panel-intro">
        Save your resume to finish your profile and apply for roles.
      </p>
      <ResumeForm userId={session.user.id} onboarding next={next} />
    </AuthShell>
  );
}
