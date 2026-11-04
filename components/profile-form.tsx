"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download, LoaderCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { Field, ResumePicker } from "./fields";
import { profileSchema, settings } from "@/lib/validation";
import { uploadResume } from "@/lib/upload-client";
type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredWorkSetting: string;
  referredBy: string;
  talentPoolOptIn: boolean;
  resumeName?: string | null;
};
export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [v, setV] = useState(profile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = profileSchema.safeParse(v);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Your profile has been updated.");
      router.refresh();
    } catch (e) {
      const m =
        e instanceof Error ? e.message : "Could not save. Please retry.";
      setError(m);
      toast.error(m);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="profile-grid">
      <form className="profile-panel form-stack" onSubmit={save} noValidate>
        <div>
          <div className="eyebrow">THE BASICS</div>
          <h2>Your details</h2>
        </div>
        <Field
          label="Full name"
          value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value })}
          required
          autoComplete="name"
        />
        <Field label="Email address" type="email" value={v.email} readOnly />
        <p className="field-help">
          Your email is used to sign in. Contact ACES if you need to change it.
        </p>
        <Field
          label="Phone number"
          type="tel"
          optional
          value={v.phone}
          onChange={(e) => setV({ ...v, phone: e.target.value })}
        />
        <div className="field">
          <label htmlFor="profile-setting">Preferred work setting</label>
          <select
            id="profile-setting"
            value={v.preferredWorkSetting}
            onChange={(e) =>
              setV({ ...v, preferredWorkSetting: e.target.value })
            }
          >
            {settings.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <Field
          label="Referred by"
          optional
          value={v.referredBy}
          onChange={(e) => setV({ ...v, referredBy: e.target.value })}
        />
        <label className="checkbox-card">
          <input
            type="checkbox"
            checked={v.talentPoolOptIn}
            onChange={(e) => setV({ ...v, talentPoolOptIn: e.target.checked })}
          />
          <span>
            <strong>Future talent pool</strong>
            <small>
              Opt in to receive email notifications for future projects,
              short-term contracts, and long-term hiring opportunities.
            </small>
          </span>
        </label>
        {error ? (
          <p role="alert" className="error-box">
            {error}
          </p>
        ) : null}
        <button className="button accent" disabled={busy}>
          {busy ? (
            <>
              <LoaderCircle className="animate-spin" size={17} /> Saving…
            </>
          ) : (
            <>
              Save changes <Check size={17} />
            </>
          )}
        </button>
      </form>
      <div>
        <div className="profile-panel">
          <div className="eyebrow">YOUR EXPERIENCE</div>
          <h2>Your resume</h2>
          <div className="saved-resume">
            <FileText size={22} />
            <span>{profile.resumeName || "Saved resume"}</span>
            <a href="/api/resume/download" aria-label="Download your resume">
              <Download size={18} />
            </a>
          </div>
          <p className="text-sm text-muted my-5">
            A new resume will be used for future applications. Previous
            applications keep the version you submitted.
          </p>
          <ResumeForm userId={profile.id} />
        </div>
      </div>
    </div>
  );
}
export function ResumeForm({
  userId,
  onboarding = false,
}: {
  userId: string;
  onboarding?: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose your resume first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await uploadResume(file, userId, setProgress);
      toast.success("Your resume is saved.");
      if (onboarding) router.push("/careers");
      router.refresh();
      setFile(null);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Upload failed. Please retry.";
      setError(m);
      toast.error(m);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <ResumePicker
        file={file}
        onChange={(f) => {
          setFile(f);
          setError("");
        }}
        error={error}
        disabled={busy}
      />
      {busy ? (
        <div className="upload-progress" role="status">
          <span>
            {progress === 100
              ? "Verifying your resume…"
              : `Uploading… ${progress}%`}
          </span>
          <progress
            max={100}
            value={progress}
            aria-label="Resume upload progress"
          />
        </div>
      ) : null}
      <button className="button w-full mt-5" disabled={busy}>
        {busy ? (
          <>
            <LoaderCircle size={17} className="animate-spin" /> Please wait
          </>
        ) : onboarding ? (
          "Save and explore opportunities"
        ) : (
          "Update resume"
        )}
      </button>
    </form>
  );
}
