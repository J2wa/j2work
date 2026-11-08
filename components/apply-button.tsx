"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export function ApplyButton({
  jobId,
  title,
  applied,
  signedIn,
  resumeReady,
}: {
  jobId: string;
  title: string;
  applied: boolean;
  signedIn: boolean;
  resumeReady: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  if (applied || done)
    return (
      <span className="status-badge" role="status">
        Already Applied
      </span>
    );
  if (!signedIn || !resumeReady)
    return (
      <Link
        className="button small"
        href={!signedIn ? "/login" : "/onboarding"}
        aria-label={`Apply for ${title}`}
      >
        Apply
      </Link>
    );
  async function apply() {
    setBusy(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 409)
        throw new Error(data.error || "Could not apply. Please retry.");
      setDone(true);
      toast.success(
        res.status === 409
          ? "You have already applied for this role."
          : "Application submitted using your saved resume.",
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      className="button small"
      disabled={busy}
      onClick={apply}
      aria-label={`Apply for ${title}`}
    >
      {busy ? "Submitting…" : "Apply"}
    </button>
  );
}
