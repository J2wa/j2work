"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import {
  CREDENTIAL_LEVELS,
  EXPERIENCE_LEVELS,
  SPECIALIST_DOMAINS,
} from "@/lib/role-catalog";
import { formatRoleLabel } from "@/lib/role-display";
import { settings, specialistSchema } from "@/lib/validation";

const initialValues = {
  fullName: "",
  email: "",
  primaryDomain: "" as string,
  specialtyDetails: "",
  yearsExperience: "" as string,
  highestCredential: "" as string,
  preferredWorkSetting: "Project-Basis" as (typeof settings)[number],
  portfolioUrl: "",
  availabilityNotes: "",
};

export function SpecialistPoolForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<{
    name: string;
    domain: string;
    updated: boolean;
  } | null>(null);

  function update(key: keyof typeof initialValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "", form: "" }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = specialistSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/specialists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error || "Could not submit your details. Please try again.",
        );
      }
      setSubmitted({
        name: parsed.data.fullName,
        domain: parsed.data.primaryDomain,
        updated: Boolean(data.updated),
      });
      toast.success(
        data.updated
          ? "Your specialist talent pool profile has been updated."
          : "Welcome to the ACES Domain Specialist Talent Pool!",
      );
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

  if (submitted) {
    return (
      <div className="specialist-card specialist-success" role="status">
        <div className="specialist-success-icon">
          <CheckCircle2 size={28} aria-hidden="true" />
        </div>
        <h3>
          {submitted.updated
            ? "Your specialist profile is updated"
            : "You’re in the specialist talent pool"}
        </h3>
        <p>
          Thank you, <strong>{submitted.name}</strong>. Our recruitment team has
          recorded your expertise in <strong>{submitted.domain}</strong> and
          will reach out as matching AI evaluation and advisory projects open.
        </p>
        <div className="specialist-success-actions">
          <Link href="/signup" className="button">
            Create full applicant profile{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setSubmitted(null);
            }}
          >
            Update details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="specialist-card"
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="specialist-form-title"
    >
      <div className="specialist-card-head">
        <h3 id="specialist-form-title">Join the Domain Specialist Pool</h3>
        <p>
          Share your domain credentials once. We’ll contact you directly for
          future expert-level AI training, review, and research engagements.
        </p>
      </div>

      <fieldset disabled={busy} className="contents">
        <div className="form-stack specialist-stack">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="sp-name">Full name</label>
              <input
                id="sp-name"
                type="text"
                autoComplete="name"
                placeholder="Dr. Maria Santos"
                value={values.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                aria-invalid={Boolean(errors.fullName)}
                required
              />
              {errors.fullName ? (
                <p className="field-error">{errors.fullName}</p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="sp-email">Email address</label>
              <input
                id="sp-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                aria-invalid={Boolean(errors.email)}
                required
              />
              {errors.email ? (
                <p className="field-error">{errors.email}</p>
              ) : null}
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="sp-domain">Primary domain</label>
              <select
                id="sp-domain"
                value={values.primaryDomain}
                onChange={(e) => update("primaryDomain", e.target.value)}
                aria-invalid={Boolean(errors.primaryDomain)}
                required
              >
                <option value="">Select your field…</option>
                {SPECIALIST_DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
              {errors.primaryDomain ? (
                <p className="field-error">{errors.primaryDomain}</p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="sp-credential">Highest credential</label>
              <select
                id="sp-credential"
                value={values.highestCredential}
                onChange={(e) => update("highestCredential", e.target.value)}
                aria-invalid={Boolean(errors.highestCredential)}
                required
              >
                <option value="">Select credential…</option>
                {CREDENTIAL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {errors.highestCredential ? (
                <p className="field-error">{errors.highestCredential}</p>
              ) : null}
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="sp-specialty">Specialty / role focus</label>
              <input
                id="sp-specialty"
                type="text"
                placeholder="e.g. Internal Medicine MD, Rust/Python, CPA Audit"
                maxLength={240}
                value={values.specialtyDetails}
                onChange={(e) => update("specialtyDetails", e.target.value)}
                aria-invalid={Boolean(errors.specialtyDetails)}
                required
              />
              {errors.specialtyDetails ? (
                <p className="field-error">{errors.specialtyDetails}</p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="sp-years">Experience</label>
              <select
                id="sp-years"
                value={values.yearsExperience}
                onChange={(e) => update("yearsExperience", e.target.value)}
                aria-invalid={Boolean(errors.yearsExperience)}
                required
              >
                <option value="">Years in field…</option>
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
              {errors.yearsExperience ? (
                <p className="field-error">{errors.yearsExperience}</p>
              ) : null}
            </div>
          </div>

          <fieldset className="work-setting">
            <legend>Preferred engagement</legend>
            <div>
              {settings.map((s) => (
                <label
                  key={s}
                  className={values.preferredWorkSetting === s ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="specialistWorkSetting"
                    value={s}
                    checked={values.preferredWorkSetting === s}
                    onChange={() => update("preferredWorkSetting", s)}
                  />
                  {formatRoleLabel(s)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="sp-portfolio">
              LinkedIn, Scholar, GitHub, or portfolio <span>Optional</span>
            </label>
            <input
              id="sp-portfolio"
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
              maxLength={500}
              value={values.portfolioUrl}
              onChange={(e) => update("portfolioUrl", e.target.value)}
              aria-invalid={Boolean(errors.portfolioUrl)}
            />
            {errors.portfolioUrl ? (
              <p className="field-error">{errors.portfolioUrl}</p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="sp-notes">
              Availability, languages, or topics <span>Optional</span>
            </label>
            <textarea
              id="sp-notes"
              rows={2}
              maxLength={1000}
              placeholder="Share weekly hours available, languages spoken, or niche subfields."
              value={values.availabilityNotes}
              onChange={(e) => update("availabilityNotes", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {errors.form ? (
        <div className="error-box" role="alert">
          {errors.form}
        </div>
      ) : null}

      <button type="submit" className="button w-full mt-5" disabled={busy}>
        {busy ? (
          <>
            <LoaderCircle size={17} className="animate-spin" /> Submitting…
          </>
        ) : (
          <>
            Join specialist talent pool{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>
      <p className="specialist-footnote">
        No commitment required. Your details are reviewed solely by ACES
        Intelligence for upcoming specialist projects.{" "}
        <Link href="/privacy">Privacy notice</Link>
      </p>
    </form>
  );
}
