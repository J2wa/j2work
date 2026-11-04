import { Brand, Footer } from "@/components/brand";
import { PortalNav } from "@/components/portal-nav";
import { requireApplicant } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const applicant = await requireApplicant();
  return (
    <>
      <header className="site-header">
        <div className="shell flex justify-between items-center gap-4">
          <Brand />
          <div className="applicant-badge">
            <span>
              {applicant.name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <strong>{applicant.name}</strong>
              <small>Applicant portal</small>
            </div>
          </div>
        </div>
      </header>
      <div className="shell">
        <PortalNav />
      </div>
      <main id="main" className="shell portal-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
