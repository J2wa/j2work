"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin, Pause, Play } from "lucide-react";
import type { Job } from "@/lib/db/schema";
import { JobHeaderImage } from "./job-header-image";
import { HourlyRates } from "./hourly-rates";
import { ApplyButton } from "./apply-button";

export function JobCarousel({
  jobs, appliedIds, signedIn, resumeReady,
}: {
  jobs: Job[];
  appliedIds: string[];
  signedIn: boolean;
  resumeReady: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const current = Math.min(index, Math.max(0, jobs.length - 1));
  const canRotate = jobs.length > 1;

  const scrollToIndex = useCallback((next: number, smooth = true) => {
    const viewport = viewportRef.current;
    const card = viewport?.children.item(next) as HTMLElement | null;
    if (!viewport || !card) return;
    const left = card.offsetLeft - viewport.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    viewport.scrollTo({ left, behavior: smooth ? "smooth" : "instant" });
  }, []);

  const moveTo = useCallback((next: number) => {
    if (!jobs.length) return;
    const normalized = (next + jobs.length) % jobs.length;
    setIndex(normalized);
    scrollToIndex(normalized);
  }, [jobs.length, scrollToIndex]);

  useEffect(() => {
    const onResize = () => scrollToIndex(current, false);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [current, scrollToIndex]);

  useEffect(() => {
    if (!canRotate || paused || interacting) return;
    const timer = window.setInterval(() => moveTo(index + 1), 5500);
    return () => window.clearInterval(timer);
  }, [canRotate, paused, interacting, index, moveTo]);

  function handleScroll() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(viewport.children).forEach((child, i) => {
      const card = child as HTMLElement;
      const cardCenter = card.offsetLeft - viewport.offsetLeft + card.offsetWidth / 2;
      const delta = Math.abs(center - cardCenter);
      if (delta < distance) { distance = delta; nearest = i; }
    });
    setIndex((previous) => previous === nearest ? previous : nearest);
  }

  if (!jobs.length) {
    return (
      <div className="empty-state">
        <BriefcaseBusiness size={28} className="text-accent" />
        <h3>No open positions right now.</h3>
        <p>Please check back soon for new opportunities.</p>
        <Link className="text-link" href="/signup">Create your profile →</Link>
      </div>
    );
  }

  return (
    <section className="opportunity-carousel" aria-roledescription="carousel" aria-label="Available jobs">
      <div className="carousel-toolbar">
        <div>
          <span className="eyebrow">FIND YOUR NEXT CHAPTER</span>
          <h2 className="carousel-section-title">Explore open opportunities</h2>
          <p className="carousel-section-subtitle">Discover a role where you can make an impact.</p>
        </div>
        <span className="tag">{jobs.length} open {jobs.length === 1 ? "role" : "roles"}</span>
      </div>

      <div
        ref={viewportRef}
        className="carousel-track"
        onScroll={handleScroll}
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
        }}
        onTouchStart={() => setInteracting(true)}
        onTouchEnd={() => setInteracting(false)}
        aria-label="Job opportunities. Swipe or use the controls to browse."
        tabIndex={0}
      >
        {jobs.map((job, i) => (
          <article
            key={job.id}
            className={"carousel-card" + (i === current ? " is-current" : "")}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${jobs.length}: ${job.title}`}
          >
            <div className="carousel-art">
              <JobHeaderImage url={job.headerImageUrl} />
              {!job.headerImageUrl && (
                <div className="carousel-art-label" aria-hidden="true">
                  <BriefcaseBusiness size={26} />
                  <span>{job.department}</span>
                  <strong>Your next chapter starts here.</strong>
                </div>
              )}
            </div>
            <div className="carousel-copy">
              <span className="eyebrow text-accent">{job.department}</span>
              <h3><Link href={`/careers/jobs/${job.id}`}>{job.title}</Link></h3>
              <div className="job-meta">
                <span><MapPin size={15} />{job.remote ? "Remote · " : ""}{job.location}</span>
                <span>{job.workSetting}</span>
              </div>
              <HourlyRates job={job} />
              <p>{job.summary}</p>
              <div className="carousel-actions">
                <ApplyButton jobId={job.id} title={job.title} applied={appliedIds.includes(job.id)}
                  signedIn={signedIn} resumeReady={resumeReady} />
                <Link className="text-link" href={`/careers/jobs/${job.id}`}>View role <ArrowRight size={16} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="carousel-controls">
        <button type="button" className="button secondary small carousel-arrow" aria-label="Previous job"
          disabled={!canRotate} onClick={() => moveTo(current - 1)}><ArrowLeft size={18} /></button>
        <div className="carousel-dots" aria-label="Choose a job">
          {jobs.map((job, i) => (
            <button key={job.id} type="button" className={"carousel-dot" + (i === current ? " active" : "")}
              aria-label={`Show job ${i + 1}: ${job.title}`} aria-current={i === current ? "true" : undefined}
              onClick={() => moveTo(i)} />
          ))}
        </div>
        <button type="button" className="button secondary small carousel-arrow" aria-label="Next job"
          disabled={!canRotate} onClick={() => moveTo(current + 1)}><ArrowRight size={18} /></button>
        {canRotate && <button type="button" className="carousel-play" onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Resume automatic carousel" : "Pause automatic carousel"}
          title={paused ? "Resume auto-scroll" : "Pause auto-scroll"}>
          {paused ? <Play size={16} /> : <Pause size={16} />}
          <span>{paused ? "Play" : "Pause"}</span>
        </button>}
      </div>
      <p className="carousel-counter" aria-live="off">{current + 1} of {jobs.length} opportunities</p>
    </section>
  );
}
