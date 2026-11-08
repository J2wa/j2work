import Link from "next/link";
export default function Forbidden() {
  return (
    <main id="main" className="shell portal-main">
      <div className="empty-state">
        <h1>Administrator access required</h1>
        <p>Your account does not have access to recruitment management.</p>
        <Link className="button" href="/careers">
          Back to careers
        </Link>
      </div>
    </main>
  );
}
