"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Job } from "@/lib/db/schema";
import { jobSchema, settings } from "@/lib/validation";
import type { z } from "zod";
type Input = z.infer<typeof jobSchema>;
const empty: Input = {
  title: "",
  department: "",
  roleType: "",
  workSetting: "Full-Time",
  location: "",
  remote: true,
  summary: "",
  description: "",
  requirements: "",
  isActive: false,
};
export function JobManagement({ jobs }: { jobs: Job[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Input>(empty);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function save(id: string | null, data: Input | { isActive: boolean }) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/jobs${id ? `/${id}` : ""}`, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not save job.");
      toast.success("Job saved.");
      setShow(false);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not save job.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  function field(name: keyof Input, value: string | boolean) {
    setForm((f) => ({ ...f, [name]: value }));
  }
  return (
    <>
      <button
        className="button mb-6"
        disabled={busy}
        onClick={() => {
          setEditing(null);
          setForm(empty);
          setShow(true);
          setError("");
        }}
      >
        Create job
      </button>
      {show && (
        <form
          className="panel form-stack mb-6"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = jobSchema.safeParse(form);
            if (!parsed.success) {
              setError(parsed.error.issues[0].message);
              return;
            }
            save(editing, parsed.data);
          }}
        >
          <h2>{editing ? "Edit job" : "New job"}</h2>
          <div className="form-grid">
            {(
              [
                ["title", "Job title", 160],
                ["department", "Department", 120],
                ["roleType", "Role type", 120],
                ["location", "Location", 160],
              ] as const
            ).map(([name, label, max]) => (
              <label key={name} className="field">
                {label}
                <input
                  required
                  maxLength={max}
                  value={form[name]}
                  disabled={busy}
                  onChange={(e) => field(name, e.target.value)}
                />
              </label>
            ))}
            <label className="field">
              Work setting
              <select
                value={form.workSetting}
                disabled={busy}
                onChange={(e) => field("workSetting", e.target.value)}
              >
                {settings.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          {(
            [
              ["summary", "Brief summary", 500],
              ["description", "Description", 15000],
              ["requirements", "Requirements (one per line)", 10000],
            ] as const
          ).map(([name, label, max]) => (
            <label className="field" key={name}>
              {label}
              <textarea
                required
                rows={name === "summary" ? 2 : 5}
                maxLength={max}
                value={form[name]}
                disabled={busy}
                onChange={(e) => field(name, e.target.value)}
              />
            </label>
          ))}
          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.remote}
              disabled={busy}
              onChange={(e) => field("remote", e.target.checked)}
            />
            Remote work available
          </label>
          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.isActive}
              disabled={busy}
              onChange={(e) => field("isActive", e.target.checked)}
            />
            Active — visible to applicants
          </label>
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button disabled={busy} className="button">
              {busy ? "Saving…" : "Save job"}
            </button>
            <button
              type="button"
              disabled={busy}
              className="button secondary"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="job-grid">
        {jobs.map((job) => (
          <article className="job-card" key={job.id}>
            <span
              className={`status-badge ${job.isActive ? "submitted" : "not_selected"}`}
            >
              {job.isActive ? "Active" : "Inactive"}
            </span>
            <h2 className="mt-4">{job.title}</h2>
            <p>
              {job.department} · {job.workSetting} · {job.location}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className="button small secondary"
                disabled={busy}
                onClick={() => {
                  setForm(
                    jobSchema.parse({
                      title: job.title,
                      department: job.department,
                      roleType: job.roleType,
                      workSetting: job.workSetting,
                      location: job.location,
                      remote: job.remote,
                      summary: job.summary,
                      description: job.description,
                      requirements: job.requirements,
                      isActive: job.isActive,
                    }),
                  );
                  setEditing(job.id);
                  setShow(true);
                  setError("");
                  window.scrollTo({ top: 0 });
                }}
              >
                Edit
              </button>
              <button
                className="button small secondary"
                disabled={busy}
                onClick={() => save(job.id, { isActive: !job.isActive })}
              >
                {job.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {!jobs.length && (
        <div className="empty-state">
          <h2>No jobs yet</h2>
          <p>
            Create a job and activate it when you are ready to accept
            applications.
          </p>
        </div>
      )}
    </>
  );
}
