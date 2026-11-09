import Link from "next/link";
import { BriefcaseBusiness, FileText, CheckCircle2, ArrowUpRight, ShieldCheck } from "lucide-react";
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
        <section className="shell homepage-careers-cta" aria-labelledby="find-roles">
          <div>
            <span className="eyebrow text-accent">EXPLORE CURRENT OPENINGS</span>
            <h2 id="find-roles">Find a role that fits your skills.</h2>
            <p>Explore opportunities, filter by work arrangement and department, and view full requirements before applying. You can browse roles without creating an account.</p>
          </div>
          <Link href="/careers" className="button">
            Browse available roles <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
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
        <section className="shell homepage-privacy-note" aria-label="Applicant privacy">
          <ShieldCheck size={22} aria-hidden="true" />
          <div>
            <h2>Your application, in your hands.</h2>
            <p>Upload your resume once, review application statuses from your account, and choose whether to be contacted about future opportunities. Learn how your data is handled in our <Link href="/privacy">applicant privacy notice</Link>.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
