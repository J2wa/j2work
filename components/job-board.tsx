"use client";
import { useDeferredValue, useState } from "react";
import { Search } from "lucide-react";
import type { Job } from "@/lib/db/schema";
import { formatRoleLabel } from "@/lib/role-display";
import { RoleRow } from "./role-row";
import { settings } from "@/lib/validation";
export function JobBoard({
  jobs,
  appliedIds,
  signedIn,
  resumeReady,
}: {
  jobs: Job[];
  appliedIds: string[];
  signedIn: boolean;
  resumeReady: boolean;
}) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [setting, setSetting] = useState("");
  const search = useDeferredValue(query.toLowerCase().trim());
  const filtered = jobs.filter(
    (j) =>
      (!search ||
        [j.title, j.summary, j.department, j.location]
          .join(" ")
          .toLowerCase()
          .includes(search)) &&
      (!department || j.department === department) &&
      (!role || j.roleType === role) &&
      (!setting || j.workSetting === setting),
  );
  const showFilters = jobs.length > 6;
  const hasFilters = Boolean(query || department || role || setting);
  function clear() {
    setQuery("");
    setDepartment("");
    setRole("");
    setSetting("");
  }
  return (
    <>
      {showFilters && (
        <div className="search-filter">
          <div className="search-box">
            <Search size={20} aria-hidden="true" />
            <label htmlFor="job-search" className="sr-only">
              Search roles
            </label>
            <input
              id="job-search"
              type="search"
              placeholder="Search roles, skills, or keywords…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <label className="sr-only" htmlFor="department">
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All departments</option>
              {[...new Set(jobs.map((j) => j.department))].sort().map((d) => (
                <option key={d} value={d}>
                  {formatRoleLabel(d)}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="role-type">
              Role type
            </label>
            <select
              id="role-type"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">All role types</option>
              {[...new Set(jobs.map((j) => j.roleType))].sort().map((d) => (
                <option key={d} value={d}>
                  {formatRoleLabel(d)}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="work-setting">
              Work setting
            </label>
            <select
              id="work-setting"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
            >
              <option value="">All work settings</option>
              {settings.map((d) => (
                <option key={d} value={d}>
                  {formatRoleLabel(d)}
                </option>
              ))}
            </select>
            {hasFilters ? (
              <button className="text-link" onClick={clear}>
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
      )}
      <p className="role-count" aria-live="polite">
        {hasFilters
          ? `${filtered.length} of ${jobs.length} open`
          : `${jobs.length} open`}
      </p>
      {filtered.length > 0 ? (
        <ul className="role-list" role="list">
          {filtered.map((job) => (
            <RoleRow
              key={job.id}
              job={job}
              heading="h2"
              applied={appliedIds.includes(job.id)}
              signedIn={signedIn}
              resumeReady={resumeReady}
            />
          ))}
        </ul>
      ) : (
        <p className="empty-roles">
          {hasFilters
            ? "No roles match your filters."
            : "No open roles right now."}
        </p>
      )}
    </>
  );
}
