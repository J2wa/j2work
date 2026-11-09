"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  LoaderCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
export function ApplyForm({
  jobId,
  applied,
  resumeName,
}: {
  jobId: string;
  applied: boolean;
  resumeName: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(applied);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverNote: note }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setDone(true);
        toast.info("You have already applied for this role.");
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      toast.success("Application submitted. Good luck!");
      router.refresh();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not submit. Please retry.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside className="apply-panel">
      {done ? (
        <>
          <CheckCircle2 size={32} className="text-success" />
          <h2>You’re in the running.</h2>
          <p>
            Your application has been submitted. You can follow its status in
            your portal.
          </p>
          <Link href="/careers/applications" className="button w-full">
            View my applications </Link>
        </>
      ) : (
        <>
          <div className="eyebrow">TAKE THE NEXT STEP</div>
          <h2>Make your move.</h2>
          <p>Apply with your saved profile and resume.</p>
          <div className="saved-resume">
            <FileText size={20} />
            <span>{resumeName}</span>
            <Link href="/careers/profile">Edit</Link>
          </div>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="cover-note">
                A note to our team <span>Optional</span>
              </label>
              <textarea
                id="cover-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={3000}
                rows={5}
                placeholder="Tell us what makes this opportunity a good fit for you."
              />
              <p className="field-help text-right">{note.length} / 3,000</p>
            </div>
            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}
            <button className="button accent w-full mt-4" disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />{" "}
                  Submitting…
                </>
              ) : (
                <>
                  Apply now </>
              )}
            </button>
            <p className="text-xs text-muted mt-4">
              Your profile and resume will be shared with the ACES hiring team
              for this role.
            </p>
          </form>
        </>
      )}
    </aside>
  );
}
