import { SetupNotice } from "@/components/setup-notice";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { safeReturnPath } from "@/lib/return-path";
export const metadata = { title: "Log in" };
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = safeReturnPath((await searchParams).next);
  return (
    <AuthShell>
      {process.env.TURSO_DATABASE_URL ? (
        <LoginForm next={next} />
      ) : (
        <SetupNotice />
      )}
    </AuthShell>
  );
}
