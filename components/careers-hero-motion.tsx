"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { AcesLogoMark } from "./brand";

interface CareerFlow {
  id: string;
  tab: string;
  tag: string;
  s1Label: string;
  s1Text: string;
  s2Label: string;
  s2Text: string;
  s3Label: string;
  s3Text: string;
  href: string;
  cta: string;
}

const FLOWS: CareerFlow[] = [
  {
    id: "annotation",
    tab: "Data & Multimodal",
    tag: "Remote",
    s1Label: "Your Focus",
    s1Text: "Speech, video, music, image & multilingual review",
    s2Label: "ACES Careers",
    s2Text: "Clear project rubrics with transparent PHP & USD rates",
    s3Label: "Outcome",
    s3Text: "Verified datasets powering reliable multimodal AI",
    href: "/careers",
    cta: "Browse annotation roles",
  },
  {
    id: "rlhf",
    tab: "Model Evaluation",
    tag: "PHP / USD",
    s1Label: "Your Judgment",
    s1Text: "Factuality grading, reasoning review & safety red-teaming",
    s2Label: "ACES Careers",
    s2Text: "Calibrated evaluator tracks with senior reviewer feedback",
    s3Label: "Outcome",
    s3Text: "Sharper, safer model responses shipped globally",
    href: "/careers",
    cta: "Browse evaluation roles",
  },
  {
    id: "qa",
    tab: "Quality & Ops",
    tag: "Flexible",
    s1Label: "Your Craft",
    s1Text: "Edge-case triage, rubric calibration & QA leadership",
    s2Label: "ACES Careers",
    s2Text: "One reusable profile with live application tracking",
    s3Label: "Outcome",
    s3Text: "Dependable remote delivery across global AI teams",
    href: "/careers",
    cta: "Browse QA & ops roles",
  },
  {
    id: "specialists",
    tab: "Domain Specialists",
    tag: "Priority",
    s1Label: "Your Credentials",
    s1Text: "Medicine, law, engineering, finance, STEM & linguistics",
    s2Label: "Specialist Pool",
    s2Text: "Vetted expert bench matched before public listings",
    s3Label: "Outcome",
    s3Text: "Priority invitations to high-impact advisory AI projects",
    href: "#specialist-pool",
    cta: "Join specialist pool",
  },
];

const CYCLE_MS = 4400;

export function CareersHeroMotion() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [progress, setProgress] = useState(0);
  const hoveringRef = useRef(false);
  const elapsedRef = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) setIsPlaying(false);
  }, []);

  const switchTo = (nextIdx: number) => {
    const normalized = (nextIdx + FLOWS.length) % FLOWS.length;
    elapsedRef.current = 0;
    setProgress(0);
    if (reducedRef.current) {
      setActiveIdx(normalized);
      return;
    }
    setIsSwitching(true);
    window.setTimeout(() => {
      setActiveIdx(normalized);
      setIsSwitching(false);
    }, 150);
  };

  useEffect(() => {
    if (!isPlaying || reducedRef.current) {
      setProgress(0);
      return;
    }
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      if (!hoveringRef.current && !document.hidden) {
        elapsedRef.current += dt;
        if (elapsedRef.current >= CYCLE_MS) {
          elapsedRef.current = 0;
          setIsSwitching(true);
          window.setTimeout(() => {
            setActiveIdx((prev) => (prev + 1) % FLOWS.length);
            setIsSwitching(false);
          }, 150);
        }
        setProgress(Math.min(100, (elapsedRef.current / CYCLE_MS) * 100));
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const current = FLOWS[activeIdx];

  return (
    <div
      className="hero-careers-stage"
      onPointerEnter={() => {
        hoveringRef.current = true;
      }}
      onPointerLeave={() => {
        hoveringRef.current = false;
      }}
      aria-label="Interactive ACES Careers workflow preview"
    >
      <div className="hero-careers-head">
        <div className="hero-careers-brand">
          <span className="hero-careers-mark">
            <AcesLogoMark
              size={28}
              theme="dark"
              wordmark="hide"
              animate="none"
              track="off"
            />
          </span>
          <div>
            <strong>ACES Careers Portal</strong>
            <span>careers.acesintelligence.xyz</span>
          </div>
        </div>
        <span className="hero-live-pill">{current.tag}</span>
      </div>

      <div
        className="hero-flow-tabs"
        role="tablist"
        aria-label="Preview career tracks"
      >
        {FLOWS.map((flow, idx) => {
          const active = idx === activeIdx;
          return (
            <button
              key={flow.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`hf-tab ${active ? "is-active" : ""}`}
              onClick={() => switchTo(idx)}
            >
              {flow.tab}
            </button>
          );
        })}
      </div>

      <div
        className={`hero-flow-stage ${isSwitching ? "is-switching" : ""}`}
        aria-live="polite"
      >
        <div className="hf-node">
          <span className="hf-node__label">{current.s1Label}</span>
          <strong className="hf-node__text">{current.s1Text}</strong>
        </div>
        <div className="hf-connector" aria-hidden="true">
          <span className="hf-connector__line" />
          <span className="hf-connector__pulse" />
        </div>
        <div className="hf-node hf-node--core">
          <span className="hf-node__label">{current.s2Label}</span>
          <strong className="hf-node__text">{current.s2Text}</strong>
        </div>
        <div className="hf-connector" aria-hidden="true">
          <span className="hf-connector__line" />
          <span className="hf-connector__pulse hf-connector__pulse--delayed" />
        </div>
        <div className="hf-node hf-node--result">
          <span className="hf-node__label">{current.s3Label}</span>
          <strong className="hf-node__text">{current.s3Text}</strong>
        </div>
      </div>

      <div className="hero-flow-foot">
        <div className="hf-progress-wrap" aria-hidden="true">
          <div className="hf-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="hf-foot-row">
          <button
            type="button"
            className="hf-toggle"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? "Pause auto-cycle" : "Play auto-cycle"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
          <Link href={current.href} className="hero-careers-foot-link">
            <span>{current.cta}</span>
            <span className="hero-careers-arrow" aria-hidden="true">
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
