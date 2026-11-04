import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  ScanEye,
  Layers3,
  Workflow,
  ArrowRight,
  Check,
} from "lucide-react";
import { PublicHeader, Footer } from "@/components/brand";
const tracks = [
  {
    number: "01",
    icon: ScanEye,
    title: "Multimodal annotation",
    description: "Turn video, images, and audio into meaningful training data.",
    tags: "Video · Image · Audio",
  },
  {
    number: "02",
    icon: AudioLines,
    title: "AI model evaluation",
    description:
      "Bring human judgment to language, reasoning, and model quality.",
    tags: "RLHF · SFT · Multilingual",
  },
  {
    number: "03",
    icon: Layers3,
    title: "Quality & operations",
    description:
      "Build consistency through careful reviews and thoughtful team support.",
    tags: "Quality assurance · Delivery",
  },
  {
    number: "04",
    icon: Workflow,
    title: "Agentic AI & engineering",
    description:
      "Create practical AI tools and workflows that help people work better.",
    tags: "AI agents · Automation",
  },
];
export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main">
        <section className="shell hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="orange-dot" /> PEOPLE BEHIND THE INTELLIGENCE
            </div>
            <h1>
              Your expertise.
              <br />
              The next
              <br />
              <span className="text-accent">chapter of AI.</span>
            </h1>
            <p className="hero-description">
              Great AI starts with people like you. Bring your perspective, grow
              your skills, and do work that makes a difference.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/signup" className="button accent">
                Create your profile <ArrowUpRight size={19} />
              </Link>
              <Link href="/careers" className="text-link">
                Explore opportunities <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="mini-check">
                <Check size={12} />
              </span>{" "}
              One profile. A world of possibilities.
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-top">
              <span>ACES / HUMAN POTENTIAL</span>
              <span>↗</span>
            </div>
            <div className="arrow-sculpture">
              <span />
              <span />
              <span />
            </div>
            <div className="art-bottom">
              <span>
                MADE OF
                <br />
                <b>HUMAN INSIGHT.</b>
              </span>
              <span className="art-circle">AI</span>
            </div>
            <div className="art-caption">YOUR NEXT CHAPTER STARTS HERE</div>
          </div>
        </section>
        <section className="opportunity-strip">
          <div className="shell flex flex-wrap justify-between gap-5">
            <span>Built around your strengths.</span>
            <div className="flex flex-wrap gap-7 text-sm">
              <span>Full-time</span>
              <span>Part-time</span>
              <span>Project-based</span>
              <span className="text-accent">One team. Many paths. ↗</span>
            </div>
          </div>
        </section>
        <section className="shell section-space" id="our-work">
          <div className="section-heading">
            <div>
              <div className="eyebrow">FIND YOUR DIRECTION</div>
              <h2>
                Different skills.
                <br />
                Shared ambition.
              </h2>
            </div>
            <p>
              From the detail-oriented to the technically curious,
              <br className="hidden sm:block" /> there’s more than one way to
              help shape better AI.
            </p>
          </div>
          <div className="track-grid">
            {tracks.map((t) => (
              <article className="track-card" key={t.number}>
                <div className="flex items-center justify-between">
                  <t.icon size={25} strokeWidth={1.5} />
                  <span className="mono text-muted">{t.number}</span>
                </div>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <div className="track-tags">{t.tags}</div>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted">
            Our areas of work. Current vacancies are listed inside the careers
            portal.
          </p>
        </section>
        <section className="journey-section">
          <div className="shell journey">
            <div>
              <div className="eyebrow">A SIMPLE START</div>
              <h2>
                Less paperwork.
                <br />
                More possibility.
              </h2>
              <Link href="/signup" className="text-link mt-7">
                Let’s get started <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="journey-steps">
              {[
                [
                  "01",
                  "Tell us about yourself",
                  "Create a profile and share how you prefer to work.",
                ],
                [
                  "02",
                  "Bring your experience",
                  "Upload your resume once. Keep it ready for your next opportunity.",
                ],
                [
                  "03",
                  "Find your next role",
                  "Explore openings, apply in one click, and follow your application.",
                ],
              ].map(([n, t, d]) => (
                <div className="journey-step" key={n}>
                  <span className="step-number">{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="shell section-space">
          <div className="talent-banner">
            <div>
              <div className="eyebrow">STAY IN THE LOOP</div>
              <h2>
                Your next opportunity
                <br />
                could be just ahead.
              </h2>
              <p>
                Join our talent pool to hear about future projects,
                <br className="hidden sm:block" /> short-term contracts, and
                long-term opportunities.
              </p>
            </div>
            <Link href="/signup" className="button white">
              Join our talent pool <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
