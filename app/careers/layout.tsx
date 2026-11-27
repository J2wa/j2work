import Link from "next/link";
import { Brand, Footer, PublicHeader } from "@/components/brand";
import { PortalNav } from "@/components/portal-nav";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <>
      {session ? (
        <header className="site-header">
          <div className="shell header-row">
            <Brand />
            <div className="header-actions">
              {session.user.role === "admin" && (
                <Link href="/admin" className="text-link">
                  Admin dashboard
                </Link>
              )}
              <Link href="/careers/profile" className="button small secondary">
                My profile
              </Link>
            </div>
          </div>
        </header>
      ) : (
        <PublicHeader />
      )}
      {session && (
        <div className="portal-subnav-bar">
          <div className="shell">
            <PortalNav />
          </div>
        </div>
      )}
      <main id="main" className="shell portal-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
