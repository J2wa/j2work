"use client";
import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  MapPin,
  BriefcaseBusiness,
  Link2,
  Check,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import type { Job } from "@/lib/db/schema";
import { ApplyButton } from "./apply-button";
import { settings } from "@/lib/validation";

type Sort = "newest" | "az";
const validSort = (value: string | null): Sort =>
  value === "az" ? "az" : "newest";

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
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("newest");
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const search = useDeferredValue(query.trim().toLowerCase());

  // Filter URLs can be bookmarked or shared, without a server request per keystroke.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const departments = new Set(jobs.map((j) => j.department));
    const roles = new Set(jobs.map((j) => j.roleType));
    setQuery((params.get("q") || "").slice(0, 160));
    setDepartment(departments.has(params.get("department") || "") ? params.get("department") || "" : "");
    setRole(roles.has(params.get("role") || "") ? params.get("role") || "" : "");
    setSetting(settings.find((s) => s === params.get("setting")) || "");
    setRemoteOnly(params.get("remote") === "1");
    setSort(validSort(params.get("sort")));
    setLoaded(true);
  }, [jobs]);

  useEffect(() => {
    if (!loaded) return;
    const url = new URL(window.location.href);
    for (const key of ["q", "department", "role", "setting", "remote", "sort"]) {
      url.searchParams.delete(key);
    }
    if (query.trim()) url.searchParams.set("q", query.trim().slice(0, 160));
    if (department) url.searchParams.set("department", department);
    if (role) url.searchParams.set("role", role);
    if (setting) url.searchParams.set("setting", setting);
    if (remoteOnly) url.searchParams.set("remote", "1");
    if (sort !== "newest") url.searchParams.set("sort", sort);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [query, department, role, setting, remoteOnly, sort, loaded]);

  const filtered = jobs
    .filter(
      (j) =>
        (!search ||
          [j.title, j.summary, j.department, j.location, j.roleType, j.description, j.requirements]
            .join(" ")
            .toLowerCase()
            .includes(search)) &&
        (!department || j.department === department) &&
        (!role || j.roleType === role) &&
        (!setting || j.workSetting === setting) &&
        (!remoteOnly || j.remote),
    )
    .sort((a, b) =>
      sort === "az"
        ? a.title.localeCompare(b.title)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const hasFilters = Boolean(query || department || role || setting || remoteOnly || sort !== "newest");
  function clear() {
    setQuery("");
    setDepartment("");
    setRole("");
    setSetting("");
    setRemoteOnly(false);
    setSort("newest");
  }
  async function copySearch() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied. Share these search results with anyone.");
    } catch {
      toast.error("Could not copy the link. You can copy it from your browser's address bar.");
    }
  }

  return (
    <>
      <section className="search-filter" aria-label="Find career opportunities">
        <div className="search-box">
          <Search size={20} aria-hidden="true" />
          <label htmlFor="job-search" className="sr-only">Search jobs</label>
          <input
            id="job-search"
            type="search"
            placeholder="Search roles, skills or keywords…"
            autoComplete="off"
            maxLength={160}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-row">
          <SlidersHorizontal size={17} aria-hidden="true" />
          <label className="sr-only" htmlFor="department">Department</label>
          <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All departments</option>
            {[...new Set(jobs.map((j) => j.department))].sort().map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="role-type">Role type</label>
          <select id="role-type" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All role types</option>
            {[...new Set(jobs.map((j) => j.roleType))].sort().map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="work-setting">Work setting</label>
          <select id="work-setting" value={setting} onChange={(e) => setSetting(e.target.value)}>
            <option value="">All work settings</option>
            {settings.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="remote-toggle" htmlFor="remote-filter">
            <input
              id="remote-filter"
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
            />
            Remote available
          </label>
        </div>
      </section>

      <div className="results-heading">
        <div>
          <h2>Open opportunities <span>{filtered.length}</span></h2>
          <p aria-live="polite" aria-atomic="true">
            Showing {filtered.length} of {jobs.length} {jobs.length === 1 ? "role" : "roles"}
          </p>
        </div>
        <div className="job-toolbar">
          <label htmlFor="job-sort">Sort by</label>
          <select id="job-sort" value={sort} onChange={(e) => setSort(validSort(e.target.value))}>
            <option value="newest">Most recent</option>
            <option value="az">Job title A–Z</option>
          </select>
          <button type="button" className="tool-action" onClick={copySearch} aria-label="Copy a link to these job results">
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            {copied ? "Copied" : "Share search"}
          </button>
          {hasFilters && (
            <button type="button" className="tool-action" onClick={clear}>
              <RotateCcw size={15} /> Reset
            </button>
          )}
        </div>
      </div>

      {filtered.length ? (
        <div className="job-grid">
          {filtered.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="flex justify-between items-center gap-3">
                <span className="eyebrow text-accent">{job.department}</span>
                <span className="tag">{job.workSetting}</span>
              </div>
              <h3><Link href={"/careers/jobs/" + job.id}>{job.title}</Link></h3>
              <div className="job-meta">
                <span><MapPin size={14} aria-hidden="true" />{job.remote ? "Remote available · " : ""}{job.location}</span>
                <span><BriefcaseBusiness size={14} aria-hidden="true" />{job.roleType}</span>
              </div>
              <p>{job.summary}</p>
              <div className="job-card-bottom">
                <ApplyButton
                  jobId={job.id}
                  title={job.title}
                  applied={appliedIds.includes(job.id)}
                  signedIn={signedIn}
                  resumeReady={resumeReady}
                />
                <Link href={"/careers/jobs/" + job.id} className="text-link" aria-label={"Read more about " + job.title}>
                  View details <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <div className="empty-icon"><Search size={25} aria-hidden="true" /></div>
          <h3>{hasFilters ? "No roles match these filters" : "No open positions right now"}</h3>
          <p>{hasFilters ? "Try a broader keyword or reset the filters to see all current opportunities." : "New opportunities will be listed here once they open. Check back soon."}</p>
          {hasFilters && <button type="button" className="button secondary" onClick={clear}>Show all opportunities</button>}
        </div>
      )}
    </>
  );
}
