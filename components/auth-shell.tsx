import { Brand, Footer } from "./brand";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
export function AuthShell({
  children,
  login = false,
}: {
  children: React.ReactNode;
  login?: boolean;
}) {
  return (
    <>
      <header className="shell auth-header">
        <Brand />
        <Link href="/" className="text-link text-sm">
          <ArrowLeft size={15} /> Back to careers
        </Link>
      </header>
      <main id="main" className="shell auth-grid">
        <aside className="auth-aside">
          <div className="eyebrow">YOUR NEXT CHAPTER</div>
          <h1>
            {login ? (
              <>
                Good to have
                <br />
                you back.
              </>
            ) : (
              <>
                Big things start
                <br />
                with <span className="text-accent">you.</span>
              </>
            )}
          </h1>
          <p>
            Bring your skills. Add your perspective.
            <br />
            Help us build a more intelligent future.
          </p>
          <div className="auth-benefits">
            {[
              "One profile for every opportunity",
              "Your resume, ready when you are",
              "A clear view of your applications",
            ].map((x) => (
              <div key={x}>
                <span className="mini-check">
                  <Check size={13} />
                </span>
                {x}
              </div>
            ))}
          </div>
          <div className="mono text-xs text-muted">
            HUMAN EXPERTISE. BETTER AI.
          </div>
        </aside>
        <section className="auth-panel">{children}</section>
      </main>
      <Footer />
    </>
  );
}
