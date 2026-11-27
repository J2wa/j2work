"use client";
import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="shell portal-main">
      <div className="empty-state">
        <span className="eyebrow">Something went wrong</span>
        <h1>We couldn’t load this page.</h1>
        <p>
          The portal may be temporarily unavailable. Please retry in a moment.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="button">
            Try again
          </button>
          <Link href="/" className="button secondary">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
