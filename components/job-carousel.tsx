"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin } from "lucide-react";
import type { Job } from "@/lib/db/schema";
import { JobHeaderImage } from "./job-header-image";
import { HourlyRates } from "./hourly-rates";
import { ApplyButton } from "./apply-button";
export function JobCarousel({
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
  const [index, setIndex] = useState(0);
  const current = Math.min(index, Math.max(0, jobs.length - 1));
  const job = jobs[current];
  if (!job)
    return (
      <div className="empty-state">
        <BriefcaseBusiness size={28} className="text-accent" />
        <h3>No open positions right now.</h3>
        <p>Please check back soon for new opportunities.</p>
        <Link className="text-link" href="/signup">
          Create your profile →
        </Link>
      </div>
    );
  function move(delta: number) {
    setIndex((current + delta + jobs.length) % jobs.length);
  }
  return (
    <section
      className="opportunity-carousel"
      aria-roledescription="carousel"
      aria-label="Available jobs"
    >
      <div className="carousel-toolbar">
        <span className="eyebrow">FIND YOUR NEXT CHAPTER</span>
        <span className="tag">
          {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
        </span>
      </div>
      <article
        key={job.id}
        className="carousel-card"
        aria-roledescription="slide"
        aria-label={`${current + 1} of ${jobs.length}: ${job.title}`}
      >
        <div className="carousel-art">
          <JobHeaderImage url={job.headerImageUrl} />
          <div className="carousel-art-label">
            <BriefcaseBusiness size={32} />
            <span>{job.department}</span>
            <strong>
              Your expertise.
              <br />
              Our next breakthrough.
            </strong>
          </div>
        </div>
        <div className="carousel-copy">
          <span className="eyebrow text-accent">{job.department}</span>
          <h2>
            <Link href={`/careers/jobs/${job.id}`}>{job.title}</Link>
          </h2>
          <div className="job-meta">
            <span>
              <MapPin size={15} />
              {job.remote ? "Remote · " : ""}
              {job.location}
            </span>
            <span>{job.workSetting}</span>
          </div>
          <HourlyRates job={job} />
          <p>{job.summary}</p>
          <div className="carousel-actions">
            <ApplyButton
              jobId={job.id}
              title={job.title}
              applied={appliedIds.includes(job.id)}
              signedIn={signedIn}
              resumeReady={resumeReady}
            />
            <Link className="text-link" href={`/careers/jobs/${job.id}`}>
              View role <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </article>
      <div className="carousel-controls">
        <button
          type="button"
          className="button secondary small"
          aria-label="Previous job"
          disabled={jobs.length < 2}
          onClick={() => move(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <span aria-live="polite" aria-atomic="true">
          {current + 1} / {jobs.length}
        </span>
        <button
          type="button"
          className="button secondary small"
          aria-label="Next job"
          disabled={jobs.length < 2}
          onClick={() => move(1)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
