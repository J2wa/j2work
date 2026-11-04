"use client";
import Link from "next/link";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="shell empty-state min-h-[70vh]">
      <div className="eyebrow">LET’S TRY THAT AGAIN</div>
      <h1>We couldn’t load this page.</h1>
      <p>
        The portal may be temporarily unavailable. Please retry in a moment.
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className="button">
          Try again
        </button>
        <Link href="/" className="button secondary">
          Back to home
        </Link>
      </div>
    </main>
  );
}
