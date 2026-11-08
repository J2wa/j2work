"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applicationStatuses, statusLabels } from "@/lib/validation";
export function ApplicationActions({
  id,
  status,
  delivery,
  emailError,
}: {
  id: string;
  status: (typeof applicationStatuses)[number];
  delivery: string | null;
  emailError: string | null;
}) {
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function update(email = false) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/applications/${id}${email ? "/email" : ""}`,
        {
          method: email ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(email ? {} : { status: value }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");
      toast.success(
        email
          ? "Notification retry queued. Refresh to see its delivery status."
          : "Application status updated.",
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="application-actions">
      <span className={`status-badge ${status}`}>{statusLabels[status]}</span>
      <label className="sr-only" htmlFor={`status-${id}`}>
        Application status
      </label>
      <select
        id={`status-${id}`}
        value={value}
        disabled={busy}
        onChange={(e) => setValue(e.target.value as typeof status)}
      >
        {applicationStatuses.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s]}
          </option>
        ))}
      </select>
      <button
        className="button small"
        disabled={busy || value === status}
        onClick={() => update()}
      >
        {busy ? "Working…" : "Save status"}
      </button>
      <small>
        Recruitment email: {delivery || "Not queued (existing application)"}
      </small>
      {emailError && (
        <small>
          {emailError === "not_configured"
            ? "Email configuration required."
            : emailError === "retry_window_expired"
              ? "Check Resend delivery logs before any further send."
              : "Delivery failed. Check email configuration and retry."}
        </small>
      )}
      {delivery && ["pending", "failed", "sending"].includes(delivery) && (
        <button
          className="text-link"
          disabled={busy}
          onClick={() => update(true)}
        >
          Retry notification
        </button>
      )}
    </div>
  );
}
