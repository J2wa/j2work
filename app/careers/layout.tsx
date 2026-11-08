import Link from "next/link";
import { Brand, Footer } from "@/components/brand";
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
      <header className="site-header">
        <div className="shell header-row">
          <Brand />
          <div className="header-actions">
            {session?.user.role === "admin" && (
              <Link href="/admin" className="text-link">
                Admin dashboard
              </Link>
            )}
            <Link
              href={session ? "/careers/profile" : "/login"}
              className="text-link"
            >
              {session ? "My profile" : "Log in"}
            </Link>
          </div>
        </div>
      </header>
      <div className="shell">
        {session ? (
          <PortalNav />
        ) : (
          <nav className="portal-nav" aria-label="Careers navigation">
            <Link href="/careers" className="active">
              Careers
            </Link>
            <Link href="/signup">Create account</Link>
          </nav>
        )}
      </div>
      <main id="main" className="shell portal-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
