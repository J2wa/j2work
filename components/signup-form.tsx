"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Field, PasswordField, ResumePicker } from "./fields";
import { signupSchema, settings, resumeError } from "@/lib/validation";
import { authClient } from "@/lib/auth-client";
import { uploadResume } from "@/lib/upload-client";
export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    preferredWorkSetting: "" as string,
    referredBy: "",
    talentPoolOptIn: false,
  });
  function change(key: string, value: string | boolean) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const result = signupSchema.safeParse(values);
    const issues: Record<string, string> = {};
    if (!result.success)
      for (const i of result.error.issues)
        issues[String(i.path[0])] = i.message;
    if (step === 1) {
      const initial = Object.fromEntries(
        Object.entries(issues).filter(([k]) =>
          ["name", "email", "phone", "password"].includes(k),
        ),
      );
      if (Object.keys(initial).length) {
        setErrors(initial);
        return;
      }
      setStep(2);
      return;
    }
    const fileError = resumeError(file);
    if (fileError) issues.resume = fileError;
    if (Object.keys(issues).length) {
      setErrors(issues);
      return;
    }
    if (!result.success || !file) return;
    setBusy(true);
    try {
      let id = accountId;
      if (!id) {
        setStage("Creating your account…");
        const response = await authClient.signUp.email(result.data);
        if (response.error)
          throw new Error(
            response.error.message || "We couldn’t create your account.",
          );
        id = response.data.user.id;
        setAccountId(id);
      }
      setStage("Uploading your resume…");
      await uploadResume(file, id, setProgress);
      setStage("Opening your portal…");
      toast.success("Your profile is ready. Welcome to ACES!");
      router.push("/careers");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="flex justify-between gap-4">
        <span className="eyebrow">JOIN ACES INTELLIGENCE</span>
        <span className="mono text-xs text-muted">0{step} / 02</span>
      </div>
      <h2>Create your profile</h2>
      <p className="panel-intro">
        Already part of the team? <Link href="/login">Log in</Link>
      </p>
      <div className="form-steps">
        <span className={step === 1 ? "active" : "done"}>
          <b>{step > 1 ? <Check size={12} /> : 1}</b>Your details
        </span>
        <span className={step === 2 ? "active" : ""}>
          <b>2</b>Your next chapter
        </span>
      </div>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={busy} className="contents">
          {step === 1 ? (
            <div className="form-stack">
              <Field
                label="Full name"
                autoComplete="name"
                placeholder="Your first and last name"
                value={values.name}
                onChange={(e) => change("name", e.target.value)}
                error={errors.name}
                required
              />
              <Field
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={(e) => change("email", e.target.value)}
                error={errors.email}
                required
              />
              <Field
                label="Phone number"
                type="tel"
                autoComplete="tel"
                placeholder="+63 9XX XXX XXXX"
                value={values.phone}
                onChange={(e) => change("phone", e.target.value)}
                error={errors.phone}
                optional
              />
              <PasswordField
                autoComplete="new-password"
                placeholder="Create a secure password"
                value={values.password}
                onChange={(e) => change("password", e.target.value)}
                error={errors.password}
                required
              />
            </div>
          ) : (
            <div className="form-stack">
              <fieldset className="work-setting">
                <legend>How would you like to work?</legend>
                <div>
                  {settings.map((s) => (
                    <label
                      className={
                        values.preferredWorkSetting === s ? "selected" : ""
                      }
                      key={s}
                    >
                      <input
                        type="radio"
                        name="preferredWorkSetting"
                        value={s}
                        checked={values.preferredWorkSetting === s}
                        onChange={() => change("preferredWorkSetting", s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
                {errors.preferredWorkSetting ? (
                  <p className="field-error">{errors.preferredWorkSetting}</p>
                ) : null}
              </fieldset>
              <Field
                label="Referred by"
                placeholder="Name of the person who referred you"
                optional
                value={values.referredBy}
                onChange={(e) => change("referredBy", e.target.value)}
                error={errors.referredBy}
              />
              <ResumePicker
                file={file}
                onChange={(f) => {
                  setFile(f);
                  setErrors((e) => ({ ...e, resume: "" }));
                }}
                error={errors.resume}
                disabled={busy}
              />
              <label className="checkbox-card">
                <input
                  type="checkbox"
                  checked={values.talentPoolOptIn}
                  onChange={(e) => change("talentPoolOptIn", e.target.checked)}
                />
                <span>
                  <strong>Keep me in the loop</strong>
                  <small>
                    Opt in to receive email notifications for future projects,
                    short-term contracts, and long-term hiring opportunities.
                  </small>
                </span>
              </label>
              <p className="text-xs text-muted">
                This is optional. You can change your preference in your
                profile.
              </p>
            </div>
          )}
        </fieldset>
        {errors.form ? (
          <div className="error-box" role="alert">
            {errors.form}
            {accountId ? (
              <p>
                Your account is saved. Retry the upload below, or log in later
                to finish.
              </p>
            ) : null}
          </div>
        ) : null}
        {busy ? (
          <div className="upload-progress" role="status">
            <span>
              {stage}
              {stage.includes("Uploading") ? ` ${progress}%` : ""}
            </span>
            <progress
              max={100}
              value={progress}
              aria-label="Resume upload progress"
            />
          </div>
        ) : null}
        <div className="form-actions">
          {step === 2 && !accountId ? (
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={17} /> Back
            </button>
          ) : null}
          <button
            className="button accent flex-1"
            disabled={busy}
            type="submit"
          >
            {busy ? (
              <>
                <LoaderCircle size={18} className="animate-spin" /> Please wait
              </>
            ) : step === 1 ? (
              <>
                Continue <ArrowRight size={18} />
              </>
            ) : accountId ? (
              "Retry resume upload"
            ) : (
              <>
                Create my profile <ArrowUpRightIcon />
              </>
            )}
          </button>
        </div>
        <p className="privacy-note">
          <ShieldCheck size={15} /> Your information is handled with care.{" "}
          <Link href="/privacy">Privacy notice</Link>
        </p>
      </form>
    </>
  );
}
function ArrowUpRightIcon() {
  return <span aria-hidden="true">↗</span>;
}
