import { Brand, Footer } from "./brand";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="shell auth-header">
        <Brand />
        <Link href="/careers" className="text-link">
          Open roles
        </Link>
      </header>
      <main id="main" className="shell auth-main">
        <section className="auth-panel">{children}</section>
      </main>
      <Footer />
    </>
  );
}
