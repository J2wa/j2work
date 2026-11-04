import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="shell empty-state min-h-[80vh]">
      <div className="eyebrow">404 / NOT FOUND</div>
      <h1>This path ends here.</h1>
      <p>
        This page or opportunity is no longer available. Let’s find your next
        one.
      </p>
      <Link href="/careers" className="button">
        Explore opportunities ↗
      </Link>
    </main>
  );
}
