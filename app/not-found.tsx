import Link from "next/link";
import { PublicHeader, Footer } from "@/components/brand";

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="shell portal-main">
        <div className="empty-state">
          <span className="eyebrow">404</span>
          <h1>Page unavailable</h1>
          <p>This page or role is no longer available.</p>
          <Link href="/careers" className="button">
            Open roles
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
