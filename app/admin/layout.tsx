import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { Brand, Footer } from "@/components/brand";
import { AdminNav } from "@/components/admin-nav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recruitment administration",
  robots: { index: false, follow: false },
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <>
      <header className="site-header">
        <div className="shell header-row">
          <Brand />
          <Link href="/careers" className="button small secondary">
            View careers <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <div className="portal-subnav-bar">
        <div className="shell">
          <AdminNav />
        </div>
      </div>
      <main id="main" className="shell portal-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
