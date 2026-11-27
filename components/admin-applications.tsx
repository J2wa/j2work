"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApplicationEmailKind } from "@/lib/email";
import { applicationStatuses, statusLabels } from "@/lib/validation";

type EmailDelivery = { state: string; errorCode: string | null } | null;

export function ApplicationActions({
  id,
  status,
  recruitment,
  confirmation,
}: {
  id: string;
  status: (typeof applicationStatuses)[number];
  recruitment: EmailDelivery;
  confirmation: EmailDelivery;
}) {
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function update(email?: ApplicationEmailKind) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/applications/${id}${email ? `/email?kind=${email}` : ""}`,
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
      {(
        [
          [
            "recruitment",
            "Recruitment email",
            "Retry notification",
            recruitment,
          ],
          [
            "confirmation",
            "Applicant confirmation",
            "Retry confirmation",
            confirmation,
          ],
        ] as const
      ).map(([kind, label, retryLabel, delivery]) => (
        <div className="grid gap-1" key={kind}>
          <small>
            {label}: {delivery?.state || "Not queued"}
          </small>
          {delivery?.errorCode && (
            <small>
              {delivery.errorCode === "not_configured"
                ? "Email configuration required."
                : delivery.errorCode === "retry_window_expired"
                  ? "Check Resend delivery logs before any further send."
                  : "Delivery failed. Check email configuration and retry."}
            </small>
          )}
          {delivery &&
            ["pending", "failed", "sending"].includes(delivery.state) && (
              <button
                className="text-link justify-self-start"
                disabled={busy}
                onClick={() => update(kind)}
              >
                {retryLabel}
              </button>
            )}
        </div>
      ))}
    </div>
  );
}
