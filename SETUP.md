# ACES Careers: administrator and email setup

Project: **aces-careers** in the **ACES INTELLIGENCE** Vercel team.
Repository: https://github.com/J2wa/j2work

## Administrator access

1. Create a normal account at `/signup` (or use an existing account), then sign in.
2. Open `/admin`. If access has not been granted, the page displays your account ID. Admin access does not require completing resume onboarding.
3. A trusted Vercel project owner must independently confirm that the account belongs to the intended administrator. Public signup does not verify email ownership, so an email address alone is not sufficient evidence.
4. In Vercel → aces-careers → Settings → Environment Variables, add `ADMIN_USER_IDS` with the approved account ID. Separate multiple IDs with commas. Apply to Production; only approve test accounts in Preview.
5. Redeploy, sign in, and open `/admin`. Create a project, fill its details, and select Published to accept applications. Uncheck Published to close it. Existing applications remain available.

Admin IDs are checked server-side on every admin page, mutation, and resume download. No public signup field can grant access.

## Resend: the account-access step

The ACES INTELLIGENCE team already has a Resend Marketplace installation. As inspected during implementation, aces-careers does not have `RESEND_API_KEY` yet.

1. Open https://vercel.com/aces-intelligence and select **aces-careers**.
2. Open the team's existing Resend integration / Marketplace resource. Use its project connection controls to connect **aces-careers**. If a Resend sign-in or authorization screen appears, complete it with your authorized company account.
3. Ensure the integration adds `RESEND_API_KEY` to **aces-careers → Settings → Environment Variables → Production**. Do not paste API keys into chat or commit them to Git.
4. Open Resend from the integration. Verify a sending domain you own, such as `acesintelligence.xyz`, using the DNS records Resend supplies. If DNS is outside Vercel, add those records at the actual DNS provider and wait for Verified status.
5. Set `RESEND_FROM_EMAIL` in the Vercel project to an address on that verified domain, for example `ACES Careers <careers@acesintelligence.xyz>`. This example is valid only after domain verification. Do not use your Gmail address as the sender.
6. Redeploy after setting the variables. Applications are addressed to **acesintelligenceph@gmail.com**. Reply-To is the applicant's email, so a normal reply reaches the applicant.
7. Submit a controlled application, confirm it appears in `/admin`, check Resend's delivery logs, and confirm receipt in Gmail. The dashboard label “Accepted by Resend” means accepted by the provider, not proof of inbox delivery.

Application emails include the project, applicant name, email, phone, cover note, and a link to the protected dashboard. Private resumes are downloaded through the dashboard, not exposed as public links.

## Delivery failures and retries

Applications and their notification payloads are committed together. Missing configuration or provider failures do not discard an application. Pending notifications appear in the dashboard with Retry email. Retry after fixing setup; no scheduled background retry is installed.

The original payload is retained for stable retries, with a per-application Resend idempotency key. Resend retains keys for 24 hours. If delivery was accepted but the database could not record that success, check the Resend log before retrying after 24 hours to avoid a duplicate notification. Once success is recorded locally, retries are no-ops.

## Database and deployment

The existing Turso database, Better Auth, and private Blob integration are retained. The additive migration creates `application_emails`; the existing build command applies tracked migrations. No seeded roles are automatically published.

Use separate Turso/Blob resources for testing. The inspected project has Turso configured only for Production. A Preview without its own database can show the public design, but signup, application submission, and admin data cannot work there. Configure Preview's own `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_URL`, auth secret, and Blob resource before full preview testing. Do not copy production applicant data into test environments.

## Verification

Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:integration`.

The integration suite uses a temporary SQLite database and tests normal applicant restrictions, duplicate submission protection, notification persistence when Resend is unavailable, admin authorization, cross-origin rejection, project creation/closing, and application status changes. It does not send real email or test external Blob delivery.
