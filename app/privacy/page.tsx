import { PublicHeader, Footer } from "@/components/brand";
export const metadata = { title: "Applicant privacy" };
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="shell privacy-page">
        <div className="eyebrow">YOUR INFORMATION MATTERS</div>
        <h1>Applicant privacy.</h1>
        <p>
          This notice explains how this careers portal uses the information you
          share with ACES Intelligence.
        </p>
        <h2>Information you provide</h2>
        <p>
          We collect your name, email, optional phone number and referral,
          preferred work setting, resume, talent pool preference, and
          applications. Authentication records support account access; passwords
          are stored as hashes.
        </p>
        <h2>How we use it</h2>
        <p>
          Your profile, resume, and cover notes support recruitment and
          application review by authorized ACES personnel. Your application
          retains the resume version you submitted. Choosing the optional talent
          pool checkbox records your permission to receive future opportunity
          emails. It does not affect your ability to apply.
        </p>
        <h2>Storage and access</h2>
        <p>
          The portal uses Turso for account and application records, and private
          Vercel Blob storage for resumes. Resume downloads require
          authenticated access. Hosting and storage providers process
          information to operate the service. Application notifications
          containing your name, contact details, project, and cover note are
          sent through Resend to the ACES hiring inbox. Resumes remain in
          private storage and are accessed by authorized hiring staff.
        </p>
        <h2>Your choices</h2>
        <p>
          You can edit your profile, replace your resume, and withdraw talent
          pool email consent in My profile. To request access, corrections,
          account deletion, or assistance, contact ACES through the{" "}
          <a href="https://acesintelligence.xyz/inquiry">
            company inquiry page
          </a>
          . Information is retained for recruitment and account administration;
          contact us to discuss removal.
        </p>
        <h2>Essential cookies</h2>
        <p>
          We use essential authentication cookies to keep you signed in. This
          application does not add advertising or third-party analytics cookies.
        </p>
      </main>
      <Footer />
    </>
  );
}
