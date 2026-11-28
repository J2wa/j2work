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

export function EcosystemBar() {
  return (
    <div
      className="aces-eco-bar"
      role="region"
      aria-label="ACES Intelligence Ecosystem switcher"
    >
      <div className="shell aces-eco-bar__inner">
        <a
          className="aces-eco-bar__brand"
          href="https://acesintelligence.xyz"
          target="_blank"
          rel="noopener noreferrer"
          title="ACES Intelligence"
          aria-label="ACES Intelligence main website"
        >
          ACES Intelligence
        </a>
        <div className="aces-eco-bar__tabs">
          <a
            className="aces-eco-tab"
            href="https://business.acesintelligence.xyz"
            target="_blank"
            rel="noopener noreferrer"
            title="ACES Business — Booking systems, retail POS, payroll & wholesale B2B"
          >
            ACES Business
          </a>
          <a
            className="aces-eco-tab"
            href="https://agents.acesintelligence.xyz"
            target="_blank"
            rel="noopener noreferrer"
            title="ACES Agents — Interactive Studio & 6 dedicated Business AI Agents"
          >
            ACES Agents
          </a>
          <Link
            className="aces-eco-tab is-current"
            href="/"
            aria-current="page"
          >
            <span className="aces-eco-tab__dot" aria-hidden="true" />
            ACES Careers
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="ACES Careers home"
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
          <Link className="text-link" href="/login">
            Log in
          </Link>
          <Link className="button small" href="/signup" data-magnetic="">
            Create profile
          </Link>
        </nav>
      </div>
      <div className="scroll-progress" id="scrollProgress" aria-hidden="true" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Brand light />
            <p className="footer-tagline">
              Remote roles and domain specialist opportunities shaping better
              AI. Part of the ACES Intelligence Ecosystem.
            </p>
          </div>
          <div className="footer-cols">
            <div>
              <h3 className="footer-col-title">ACES Careers</h3>
              <ul className="footer-col-list">
                <li>
                  <Link href="/careers">Open roles</Link>
                </li>
                <li>
                  <Link href="/#specialist-pool">Specialist talent pool</Link>
                </li>
                <li>
                  <Link href="/signup">Create profile</Link>
                </li>
                <li>
                  <Link href="/privacy">Applicant privacy</Link>
                </li>
                <li>
                  <a
                    href="https://acesintelligence.xyz/inquiry"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get in touch
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="footer-col-title">ACES Ecosystem</h3>
              <ul className="footer-col-list">
                <li>
                  <a
                    href="https://acesintelligence.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ACES Intelligence
                  </a>
                </li>
                <li>
                  <a
                    href="https://acesintelligence.xyz/ecosystem"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ACES Ecosystem
                  </a>
                </li>
                <li>
                  <a
                    href="https://business.acesintelligence.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ACES Business
                  </a>
                </li>
                <li>
                  <a
                    href="https://agents.acesintelligence.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ACES Agents
                  </a>
                </li>
                <li>
                  <Link href="/">ACES Careers</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} ACES Intelligence. All rights reserved.
          </span>
          <span>Philippines · Working globally</span>
        </div>
      </div>
    </footer>
  );
}
