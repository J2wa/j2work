import { SetupNotice } from "@/components/setup-notice";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";
export const metadata = { title: "Create your profile" };
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <AuthShell>
      {process.env.TURSO_DATABASE_URL ? <SignupForm /> : <SetupNotice />}
    </AuthShell>
  );
}
