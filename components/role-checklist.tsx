"use client";

import { Check } from "lucide-react";
import { buildRoleChecklistGroups } from "@/lib/role-catalog";

export function RoleChecklist({
  selected,
  onChange,
  extraRoles = [],
  disabled = false,
  error,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  extraRoles?: string[];
  disabled?: boolean;
  error?: string;
}) {
  const groups = buildRoleChecklistGroups(extraRoles);
  const selectedSet = new Set(selected);

  function toggle(role: string) {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    onChange([...next]);
  }

  return (
    <fieldset className="role-checklist" disabled={disabled}>
      <div className="role-checklist-head">
        <div>
          <legend>Roles you’re interested in</legend>
          <p className="role-checklist-sub">
            Check all job tracks you’d like to be considered for—now and in
            future projects.
          </p>
        </div>
        <div className="role-checklist-meta">
          <span className="role-checklist-count" aria-live="polite">
            {selected.length} selected
          </span>
          {selected.length > 0 && (
            <button
              type="button"
              className="role-checklist-clear"
              onClick={() => onChange([])}
              disabled={disabled}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="role-checklist-groups">
        {groups.map((group) => (
          <div className="role-checklist-group" key={group.category}>
            <span className="role-checklist-cat">{group.category}</span>
            <div className="role-checklist-grid">
              {group.roles.map((role) => {
                const checked = selectedSet.has(role);
                return (
                  <label
                    key={role}
                    className={`role-check-item ${checked ? "checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(role)}
                      disabled={disabled}
                    />
                    <span className="role-check-box" aria-hidden="true">
                      {checked ? <Check size={12} strokeWidth={3} /> : null}
                    </span>
                    <span className="role-check-label">{role}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
