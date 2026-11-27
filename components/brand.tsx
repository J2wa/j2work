import Image from "next/image";
import Link from "next/link";

const BODY_PATH =
  "M342 783L797 327V706H863V452H940V783H720V517L528 706H672V783Z";

export function AcesLogoMark({
  size = 46,
  theme = "light",
  wordmark = "hide",
  animate = "none",
  track = "on",
  className = "",
}: {
  size?: number;
  theme?: "light" | "dark" | "mono" | "auto";
  wordmark?: "auto" | "show" | "hide";
  animate?: "intro" | "none";
  track?: "on" | "off";
  className?: string;
}) {
  const fill = theme === "dark" ? "#FFFFFF" : "#0A3594";
  return (
    <aces-logo
      className={`aces-logo-el ${className}`.trim()}
      size={size}
      theme={theme}
      wordmark={wordmark}
      animate={animate}
      track={track}
      style={{ width: `${size}px` }}
      aria-hidden="true"
    >
      {/* Inline SVG renders immediately during SSR until Shadow DOM upgrades */}
      <svg
        viewBox="320 305 640 500"
        width={size}
        height={Math.round((size * 500) / 640)}
        aria-hidden="true"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <path d={BODY_PATH} fill={fill} />
        <rect x="863" y="327" width="77" height="78" fill={fill} />
      </svg>
    </aces-logo>
  );
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "text-white" : ""}`}
      aria-label="ACES Intelligence careers home"
    >
      <Image
        className="brand-logo"
        src={light ? "/aces-logo-white.svg" : "/aces-logo.svg"}
        alt=""
        width={38}
        height={32}
        unoptimized
      />
      <span>
        <strong>ACES</strong>
        <small>INTELLIGENCE</small>
      </span>
      <span className="brand-divider" aria-hidden="true" />
      <span className="brand-careers">CAREERS</span>
    </Link>
  );
}

export function PublicHeader() {
  return (
    <header className="site-header">
      <div className="shell header-row">
        <Brand />
        <nav aria-label="Main navigation" className="public-nav">
          <Link className="company-link" href="/careers">
            Open roles
          </Link>
          <Link className="company-link" href="/#specialist-pool">
            Specialist pool
          </Link>
          <a className="company-link" href="https://acesintelligence.xyz">
            Our company
          </a>
          <Link className="text-link" href="/login">
            Log in
          </Link>
          <Link className="button small" href="/signup">
            Create profile
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-brand-row">
          <AcesLogoMark
            size={36}
            theme="light"
            wordmark="hide"
            animate="none"
            track="off"
          />
          <div className="footer-brand-note">
            <strong>ACES Intelligence Careers</strong>
            <p>
              © {new Date().getFullYear()} ACES Intelligence. All rights
              reserved.
            </p>
          </div>
        </div>
        <div className="footer-links">
          <Link href="/careers">Open roles</Link>
          <Link href="/#specialist-pool">Specialist pool</Link>
          <Link href="/privacy">Applicant privacy</Link>
          <a href="https://acesintelligence.xyz/inquiry">Get in touch</a>
          <a href="https://acesintelligence.xyz">Our company</a>
        </div>
      </div>
    </footer>
  );
}
