import Link from "next/link";
import { BriefcaseBusiness, FileText, CheckCircle2 } from "lucide-react";
import { PublicHeader, Footer } from "@/components/brand";
export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main">
        <section className="shell landing-intro">
          <div className="eyebrow">CAREERS AT ACES INTELLIGENCE</div>
          <h1>
            Bring your expertise.
            <br />
            Build what comes next.
          </h1>
          <p>
            Help shape better AI through data annotation, model evaluation,
            quality assurance and engineering.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/careers" className="button">
              Explore opportunities →
            </Link>
            <Link href="/signup" className="button secondary">
              Create your profile
            </Link>
          </div>
        </section>
        <section className="shell landing-steps" aria-labelledby="how-it-works">
          <h2 id="how-it-works">A simple way to apply</h2>
          <div className="steps-grid">
            {[
              {
                Icon: FileText,
                title: "Create your profile",
                text: "Tell us about yourself and upload your resume once.",
              },
              {
                Icon: BriefcaseBusiness,
                title: "Find your opportunity",
                text: "Browse available roles and apply with your saved resume.",
              },
              {
                Icon: CheckCircle2,
                title: "Follow your application",
                text: "See your application status from your personal account.",
              },
            ].map(({ Icon, title, text }) => (
              <article className="panel" key={title}>
                <Icon size={24} className="text-accent" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
