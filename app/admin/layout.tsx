import Link from "next/link";
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
          <Link href="/careers" className="text-link">
            View careers
          </Link>
        </div>
      </header>
      <div className="shell">
        <AdminNav />
      </div>
      <main id="main" className="shell portal-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
