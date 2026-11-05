"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function ApplicationActions({
  id,
  status,
  pendingEmail,
}: {
  id: string;
  status: string;
  pendingEmail: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function update(body: object) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="application-actions">
      <label>
        Status
        <select
          aria-label="Application status"
          disabled={busy}
          value={status}
          onChange={(e) => update({ status: e.target.value })}
        >
          {[
            "submitted",
            "reviewing",
            "shortlisted",
            "hired",
            "not_selected",
          ].map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>
      {pendingEmail && (
        <button
          className="button small"
          disabled={busy}
          onClick={() => update({ retryEmail: true })}
        >
          {busy ? "Working…" : "Retry email"}
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
