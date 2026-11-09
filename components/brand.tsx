import Link from "next/link";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "text-white" : ""}`}
      aria-label="ACES Intelligence careers home"
    >
      <svg className="brand-logo" viewBox="335 319 610 466" aria-hidden="true">
        <image href="/aces-logo.png" width="1280" height="1280" />
      </svg>
      <span>
        <strong>ACES</strong>
        <small>INTELLIGENCE</small>
      </span>
      <span className="brand-divider" />
      <span className="brand-careers">CAREERS</span>
    </Link>
  );
}
export function PublicHeader() {
  return (
    <header className="site-header">
      <div className="shell header-row">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-3 sm:gap-7"
        >
          <a
            className="hidden text-sm sm:inline"
            href="https://acesintelligence.xyz"
          >
            Our company
          </a>
          <Link className="text-sm font-semibold" href="/login">
            Log in
          </Link>
          <Link className="button small" href="/signup">
            Join the team
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell flex flex-col justify-between gap-6 sm:flex-row">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} ACES Intelligence. Human expertise.
          Better AI.
        </p>
        <div className="flex gap-6 text-xs">
          <Link href="/privacy">Applicant privacy</Link>
          <a href="https://acesintelligence.xyz/inquiry">Get in touch</a>
        </div>
      </div>
    </footer>
  );
}
