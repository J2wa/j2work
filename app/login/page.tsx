import { SetupNotice } from "@/components/setup-notice";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
export const metadata = { title: "Log in" };
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <AuthShell login>
      {process.env.TURSO_DATABASE_URL ? <LoginForm /> : <SetupNotice />}
    </AuthShell>
  );
}
