import { eq } from "drizzle-orm";
import { SetupNotice } from "@/components/setup-notice";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { safeReturnPath } from "@/lib/return-path";

export const metadata = { title: "Create profile" };
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = safeReturnPath((await searchParams).next);
  const activeJobs = process.env.TURSO_DATABASE_URL
    ? await db()
        .select({ title: jobs.title })
        .from(jobs)
        .where(eq(jobs.isActive, true))
    : [];

  return (
    <AuthShell wide>
      {process.env.TURSO_DATABASE_URL ? (
        <SignupForm
          next={next}
          availableRoles={activeJobs.map((j) => j.title)}
        />
      ) : (
        <SetupNotice />
      )}
    </AuthShell>
  );
}
