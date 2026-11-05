"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/db/schema";
const empty = {
  title: "",
  department: "",
  roleType: "",
  workSetting: "Project-Basis",
  location: "Philippines",
  remote: true,
  summary: "",
  description: "",
  requirements: "",
  isActive: false,
};
export function AdminProjects({ projects }: { projects: Job[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/projects", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(
        form.isActive
          ? "Project published."
          : "Project saved as draft / closed.",
      );
      setId("");
      setForm(empty);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save project.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-grid">
      <section>
        <div className="section-heading">
          <h2>Project listings</h2>
          <span>{projects.length} total</span>
        </div>
        {projects.length === 0 && (
          <p className="admin-empty">
            Create your first project. Drafts stay private until you publish
            them.
          </p>
        )}
        {projects.map((p) => (
          <article className="admin-project" key={p.id}>
            <div>
              <span className={`project-status ${p.isActive ? "live" : ""}`}>
                {p.isActive ? "Published" : "Draft / closed"}
              </span>
              <h3>{p.title}</h3>
              <p>
                {p.department} · {p.workSetting}
              </p>
            </div>
            <button
              className="button small"
              onClick={() => {
                setId(p.id);
                setForm({ ...p });
                setMessage("");
                document
                  .getElementById("project-editor")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Edit
            </button>
          </article>
        ))}
      </section>
      <section id="project-editor" className="admin-editor">
        <div className="eyebrow">PROJECT WORKSPACE</div>
        <h2>{id ? "Edit project" : "Create a project"}</h2>
        <p>Publish opportunities for your next team.</p>
        <form onSubmit={submit} className="form-stack">
          {(
            [
              ["title", "Project title", 160],
              ["department", "Department", 100],
              ["roleType", "Role / specialty", 100],
              ["location", "Location", 160],
            ] as const
          ).map(([key, label, max]) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                required
                minLength={key === "title" ? 3 : 2}
                maxLength={max}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="field">
            <label htmlFor="workSetting">Work arrangement</label>
            <select
              id="workSetting"
              value={form.workSetting}
              onChange={(e) =>
                setForm({ ...form, workSetting: e.target.value })
              }
            >
              {["Full-Time", "Part-Time", "Project-Basis"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          {(
            [
              ["summary", "Short summary", 500, 10],
              ["description", "Project description", 15000, 20],
              ["requirements", "Requirements (one per line)", 8000, 5],
            ] as const
          ).map(([key, label, max, min]) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <textarea
                id={key}
                required
                minLength={min}
                maxLength={max}
                rows={key === "summary" ? 3 : 5}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={(e) => setForm({ ...form, remote: e.target.checked })}
            />{" "}
            Remote work available
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />{" "}
            Published — accepting applications
          </label>
          <button className="button accent" disabled={busy}>
            {busy ? "Saving…" : "Save project"}
          </button>
          {id && (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setId("");
                setForm(empty);
              }}
            >
              Cancel editing
            </button>
          )}
          <p role="status">{message}</p>
        </form>
      </section>
    </div>
  );
}
