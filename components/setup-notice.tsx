import Link from "next/link";
export function SetupNotice() {
  return (
    <div className="notice" role="status">
      <strong>Our applicant portal is getting ready.</strong>
      <p className="text-sm mt-2">
        Registration is not open yet. Please check back soon, or{" "}
        <a className="underline" href="https://acesintelligence.xyz/inquiry">
          contact ACES
        </a>{" "}
        about upcoming opportunities.
      </p>
      <Link href="/" className="text-link mt-5">
        Back to careers
      </Link>
    </div>
  );
}
