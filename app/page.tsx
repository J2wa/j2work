import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ScanEye,
  AudioLines,
  Layers3,
  Workflow,
  CheckCircle2,
} from "lucide-react";
import { PublicHeader, Footer } from "@/components/brand";
const tracks = [
  {
    icon: ScanEye,
    title: "Video & image annotation",
    description:
      "Give AI a clearer view of the world. Turn visual details into meaningful training data.",
    tags: "Computer vision · Data labeling",
  },
  {
    icon: AudioLines,
    title: "Language & AI evaluation",
    description:
      "Bring your perspective to language, reasoning, and the quality of AI responses.",
    tags: "Model evaluation · Multilingual",
  },
  {
    icon: Layers3,
    title: "Quality & operations",
    description:
      "Make every detail count through careful reviews, team support, and consistent delivery.",
    tags: "Quality assurance · Operations",
  },
  {
    icon: Workflow,
    title: "Engineering & automation",
    description:
      "Build practical tools and intelligent workflows that help people do their best work.",
    tags: "AI tools · Software engineering",
  },
];
export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main">
        <section className="new-hero">
          <div className="shell hero-layout">
            <div className="hero-message">
              <div className="eyebrow">
                <span className="blue-dot" /> CAREERS AT ACES INTELLIGENCE
              </div>
              <h1>
                Human talent.
                <br />
                Extraordinary
                <br />
                <span>possibilities.</span>
              </h1>
              <p>
                Help shape the next generation of AI. Bring your curiosity, your
                attention to detail, and your unique perspective. We’ll build
                what comes next, together.
              </p>
              <div className="hero-buttons">
                <Link className="button accent" href="/signup">
                  Start your application <ArrowUpRight size={19} />
                </Link>
                <Link className="text-link" href="/careers">
                  Explore projects <ArrowRight size={17} />
                </Link>
              </div>
              <div className="hero-trust">
                <CheckCircle2 size={16} /> One profile. Your next opportunity.
              </div>
            </div>
            <div className="talent-visual" aria-hidden="true">
              <div className="visual-top">
                <span>THE FUTURE IS HUMAN</span>
                <span>↗</span>
              </div>
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />
              <div className="visual-monogram">
                <span className="hero-logo">
                  <img src="/aces-logo.jpg" alt="" />
                </span>
              </div>
              <div className="visual-label label-top">
                <ScanEye size={19} />
                <div>
                  Precision in every detail<small>DATA & ANNOTATION</small>
                </div>
              </div>
              <div className="visual-label label-bottom">
                <Workflow size={19} />
                <div>
                  Ideas into impact<small>PEOPLE & TECHNOLOGY</small>
                </div>
              </div>
              <div className="visual-bottom">
                <span>
                  YOUR PERSPECTIVE.
                  <br />
                  <b>OUR NEXT BREAKTHROUGH.</b>
                </span>
                <span className="visual-star">✳</span>
              </div>
            </div>
          </div>
        </section>
        <section className="work-strip">
          <div className="shell">
            <span>FIND YOUR WAY TO WORK</span>
            <strong>Full-time</strong>
            <span className="strip-dot">•</span>
            <strong>Part-time</strong>
            <span className="strip-dot">•</span>
            <strong>Project-based</strong>
            <a href="#how-it-works">
              A simple start <ArrowRight size={16} />
            </a>
          </div>
        </section>
        <section className="shell section-space" id="our-work">
          <div className="section-heading">
            <div>
              <div className="eyebrow">WORK THAT MOVES AI FORWARD</div>
              <h2>
                Find where you
                <br />
                make a difference.
              </h2>
            </div>
            <p>
              Different strengths. A shared purpose.
              <br />
              Explore the areas where human expertise
              <br />
              makes technology better.
            </p>
          </div>
          <div className="new-track-grid">
            {tracks.map((t, i) => (
              <article className="new-track" key={t.title}>
                <div className="track-top">
                  <span className="track-icon">
                    <t.icon size={25} />
                  </span>
                  <span>0{i + 1}</span>
                </div>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <div className="track-tags">{t.tags}</div>
              </article>
            ))}
          </div>
          <p className="field-help mt-5">
            These are our areas of work. Available projects are listed in the
            careers portal.
          </p>
        </section>
        <section className="process-section" id="how-it-works">
          <div className="shell">
            <div className="section-heading">
              <div>
                <div className="eyebrow">YOUR NEXT CHAPTER, IN THREE STEPS</div>
                <h2>
                  A little about you.
                  <br />A world of possibility.
                </h2>
              </div>
              <Link href="/signup" className="button">
                Let’s get started <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="process-grid">
              {[
                [
                  "01",
                  "Create your profile",
                  "Tell us about yourself and how you prefer to work. Choose full-time, part-time, or project-based opportunities.",
                ],
                [
                  "02",
                  "Share your experience",
                  "Upload your resume and keep your details ready for the projects that interest you.",
                ],
                [
                  "03",
                  "Make your next move",
                  "Explore available projects, send your application, and follow its progress from your dashboard.",
                ],
              ].map(([n, t, d]) => (
                <article key={n}>
                  <span>{n}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="shell section-space">
          <div className="new-cta">
            <div>
              <div className="eyebrow">BRING YOUR POTENTIAL</div>
              <h2>
                Great AI starts
                <br />
                with people like you.
              </h2>
              <p>Your skills have a place in what comes next.</p>
            </div>
            <Link className="button white" href="/signup">
              Join the ACES talent pool <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
