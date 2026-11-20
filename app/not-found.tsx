import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="shell empty-state min-h-[80vh]">
      <h1>Page unavailable</h1>
      <p>This page or role is no longer available.</p>
      <Link href="/careers" className="button">
        Open roles
      </Link>
    </main>
  );
}
