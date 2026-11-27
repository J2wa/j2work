import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand, Footer } from "./brand";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page-bg">
      <header className="shell auth-header">
        <Brand />
        <Link href="/careers" className="text-link role-back">
          <ArrowLeft size={15} aria-hidden="true" /> Open roles
        </Link>
      </header>
      <main id="main" className="auth-main">
        <section className="auth-panel">{children}</section>
      </main>
      <Footer />
    </div>
  );
}
