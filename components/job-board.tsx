"use client";
import { useDeferredValue, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  MapPin,
  BriefcaseBusiness,
  ArrowRight,
} from "lucide-react";
import type { Job } from "@/lib/db/schema";
import { settings } from "@/lib/validation";
export function JobBoard({
  jobs,
  appliedIds,
}: {
  jobs: Job[];
  appliedIds: string[];
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
  const hasFilters = Boolean(query || department || role || setting);
  function clear() {
    setQuery("");
    setDepartment("");
    setRole("");
    setSetting("");
  }
  return (
    <>
      <div className="search-filter">
        <div className="search-box">
          <Search size={20} />
          <label htmlFor="job-search" className="sr-only">
            Search jobs
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
          <SlidersHorizontal size={16} aria-hidden="true" />
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
              <option key={d}>{d}</option>
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
              <option key={d}>{d}</option>
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
              <option key={d}>{d}</option>
            ))}
          </select>
          {hasFilters ? (
            <button className="text-xs underline" onClick={clear}>
              Clear filters
            </button>
          ) : null}
        </div>
      </div>
      <div className="results-heading">
        <h2>
          Open opportunities <span>{filtered.length}</span>
        </h2>
        <p aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "role" : "roles"} found
        </p>
      </div>
      {filtered.length ? (
        <div className="job-grid">
          {filtered.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="flex justify-between items-center gap-3">
                <span className="eyebrow text-accent">{job.department}</span>
                <span className="tag">{job.workSetting}</span>
              </div>
              <h3>
                <Link href={`/careers/jobs/${job.id}`}>{job.title}</Link>
              </h3>
              <div className="job-meta">
                <span>
                  <MapPin size={14} />
                  {job.remote ? "Remote · " : ""}
                  {job.location}
                </span>
                <span>
                  <BriefcaseBusiness size={14} />
                  {job.roleType}
                </span>
              </div>
              <p>{job.summary}</p>
              <div className="job-card-bottom">
                {appliedIds.includes(job.id) ? (
                  <span className="status-badge">Application submitted</span>
                ) : (
                  <span className="text-xs text-muted">
                    Bring your perspective.
                  </span>
                )}
                <Link
                  href={`/careers/jobs/${job.id}`}
                  className="text-link"
                  aria-label={`View ${job.title}`}
                >
                  View role <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={25} />
          </div>
          <h3>
            {hasFilters
              ? "No matches just yet."
              : "Your next opportunity is on its way."}
          </h3>
          <p>
            {hasFilters
              ? "Try a different keyword or clear your filters to see all open roles."
              : "There are no open roles at the moment. Keep your profile ready and opt into the talent pool for future opportunities."}
          </p>
          {hasFilters ? (
            <button className="button secondary" onClick={clear}>
              Clear all filters
            </button>
          ) : (
            <Link href="/careers/profile" className="text-link">
              Update your preferences <ArrowRight size={17} />
            </Link>
          )}
        </div>
      )}
    </>
  );
}
