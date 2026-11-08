import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { JobManagement } from "@/components/admin-jobs";
export default async function Page() {
  await requireAdmin();
  const rows = await db().select().from(jobs).orderBy(desc(jobs.createdAt));
  return (
    <>
      <div className="portal-welcome">
        <div>
          <h1>Jobs</h1>
          <p>
            Create opportunities and control which jobs appear on the careers
            page.
          </p>
        </div>
      </div>
      <JobManagement jobs={rows} />
    </>
  );
}
