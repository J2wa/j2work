"use client";

import { useState } from "react";
import type { z } from "zod";
import type { PolishedListing } from "@/lib/ai-listing";
import type { jobSchema } from "@/lib/validation";
import { JobHeaderImage } from "./job-header-image";

type JobForm = z.infer<typeof jobSchema>;

const noteFields = [
  ["listing", "Role details", 6000],
  ["instructions", "Work instructions", 4000],
  ["qualifications", "Qualifications", 4000],
] as const;

async function post<T>(action: string, data: unknown): Promise<T> {
  const response = await fetch(`/api/admin/jobs/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.error || "Could not generate a suggestion. Try again.",
    );
  return result as T;
}

export function AiDraftPanel({
  form,
  disabled,
  onApply,
}: {
  form: JobForm;
  disabled: boolean;
  onApply: (patch: Partial<JobForm>) => void;
}) {
  const [notes, setNotes] = useState({
    listing: "",
    instructions: "",
    qualifications: "",
  });
  const [draft, setDraft] = useState<PolishedListing | null>(null);
  const [sceneOverride, setSceneOverride] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pending, setPending] = useState<"polish" | "image" | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const busy = disabled || pending !== null;
  const hasNotes = Object.values(notes).some((value) => value.trim());
  const imageBrief = sceneOverride ?? draft?.imageBrief ?? "";
  const jobDetails = [
    notes.instructions,
    notes.listing,
    form.description,
    form.summary,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 15000);

  async function generate(kind: "polish" | "image") {
    setPending(kind);
    setError("");
    setStatus("");
    try {
      if (kind === "polish") {
        const { title, department, roleType, location, workSetting, remote } =
          form;
        const { listing } = await post<{ listing: PolishedListing }>(kind, {
          title,
          department,
          roleType,
          location,
          workSetting,
          remote,
          ...notes,
        });
        setDraft(listing);
        setStatus("Listing suggestion ready for review.");
      } else {
        const { url } = await post<{ url: string }>("header-image", {
          title: form.title.trim() || draft?.title || "",
          jobDetails,
          imageBrief,
        });
        setImageUrl(url);
        setStatus("Header image ready for review.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate a suggestion.",
      );
    } finally {
      setPending(null);
    }
  }

  function applyDraft() {
    if (!draft) return;
    onApply({
      title: draft.title || form.title,
      department: form.department || draft.department,
      roleType: form.roleType || draft.roleType,
      location:
        form.location ||
        (form.remote || draft.location !== "Remote" ? draft.location : ""),
      summary: draft.summary || form.summary,
      description: draft.description || form.description,
      requirements: draft.requirements || form.requirements,
    });
    setStatus("Draft copied to the job form. Review the fields before saving.");
  }

  return (
    <details className="notice">
      <summary className="py-3 font-semibold">Draft with Gemini</summary>
      <div className="form-stack">
        <p className="field-help">
          Gemini receives the role fields and notes below. Leave out applicant
          and confidential client information.
        </p>
        {noteFields.map(([name, label, maxLength]) => (
          <label className="field" key={name}>
            {label}
            <textarea
              rows={3}
              maxLength={maxLength}
              value={notes[name]}
              disabled={busy}
              onChange={(event) =>
                setNotes({ ...notes, [name]: event.target.value })
              }
            />
          </label>
        ))}
        <div>
          <button
            type="button"
            className="button"
            disabled={busy || !hasNotes}
            onClick={() => generate("polish")}
          >
            {pending === "polish" ? "Drafting…" : "Polish listing"}
          </button>
        </div>
        {draft && (
          <section
            className="form-stack border-y border-[var(--line)] py-4"
            aria-label="Listing suggestion"
          >
            <h3>Listing suggestion</h3>
            {draft.title && <strong>{draft.title}</strong>}
            <p className="flex flex-wrap gap-x-4 text-muted">
              {[draft.department, draft.roleType, draft.location]
                .filter(Boolean)
                .map((value, index) => (
                  <span key={index}>{value}</span>
                ))}
            </p>
            {draft.summary && <p>{draft.summary}</p>}
            {draft.description && (
              <p className="whitespace-pre-line">{draft.description}</p>
            )}
            {draft.requirements && (
              <p className="whitespace-pre-line">{draft.requirements}</p>
            )}
            {draft.warnings.length > 0 && (
              <div>
                <strong>Check before saving</strong>
                <ul className="list-disc pl-5">
                  {draft.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={applyDraft}
              >
                Use listing draft
              </button>
            </div>
          </section>
        )}
        <label className="field">
          Header image scene (optional)
          <textarea
            rows={3}
            maxLength={500}
            value={imageBrief}
            placeholder="Optional. Describe a specific task to show in the photo."
            disabled={busy}
            onChange={(event) => setSceneOverride(event.target.value)}
          />
        </label>
        <p className="field-help">
          Gemini uses the job description and work notes to show a person doing
          the work. Add a scene if there is a specific duty you want to feature.
        </p>
        <div>
          <button
            type="button"
            className="button secondary"
            disabled={
              busy || (jobDetails.length < 10 && imageBrief.trim().length < 10)
            }
            onClick={() => generate("image")}
          >
            {pending === "image"
              ? "Generating image…"
              : "Generate header image"}
          </button>
        </div>
        {imageUrl && (
          <div>
            <JobHeaderImage url={imageUrl} />
            <button
              type="button"
              className="button secondary"
              disabled={busy || form.headerImageUrl === imageUrl}
              onClick={() => {
                onApply({ headerImageUrl: imageUrl });
                setStatus(
                  "Header copied to the job form. Save the job to use it.",
                );
              }}
            >
              Use header image
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
        {status && <p role="status">{status}</p>}
      </div>
    </details>
  );
}
