# ACES Careers

Applicant and recruitment portal for ACES Intelligence. Next.js App Router, React, Tailwind CSS, Turso/libSQL, Drizzle ORM, Better Auth, and private Vercel Blob storage.

Production: https://careers.acesintelligence.xyz · Repository: https://github.com/J2wa/j2work

## Features

- A consistent blue-and-white interface with responsive forms, cards, navigation, application history and recruitment tables.
- Public browsing, keyword search and department/role/work-setting filters for **active jobs only**. Inactive job detail pages are unavailable even to previous applicants; their application history remains intact.
- One-click application from the careers list, using the applicant's stored, verified resume. Login and a resume are required by the server. The database's unique applicant/job constraint prevents duplicate applications.
- Two-step signup, resumable onboarding, profile editing, talent-pool consent and private PDF/DOCX uploads up to 5 MiB. Applications retain the resume version submitted at that time.
- `/admin`: overview counts, searchable/paginated applications, status updates, secure submitted-resume downloads and job creation/editing/activation/deactivation.
- Better Auth's official admin plugin, with exact `role === "admin"` authorization on every admin page and API. Roles are re-read for requests so demotion takes effect for existing sessions. Signup and profile edits cannot grant administrative privileges.
- New-application notifications to `acesintelligenceph@gmail.com`, with a durable queue, provider idempotency keys and an admin retry action. Email failure never rolls back a stored application.

**Initial email scope:** only recruitment-team notifications are enabled. Applicant confirmations, status-change emails, confirmation resends and talent-pool campaigns are deferred. Applicants see current statuses in their account. Updating a status or refreshing a page sends no email.

## Local setup

```sh
npm ci
cp .env.example .env.local
# Set the database URL, authentication secret and URL locally.
npm run db:migrate
npm run dev
```

Use `TURSO_DATABASE_URL=file:./careers.db` for local SQLite. Production on Vercel requires a remote Turso database. Uploads and resume downloads require the private Blob store. Do not commit `.env.local` or credentials.

Verified installed versions: Next.js 16.4.5, React 19.3.1, Tailwind 4.3.4, Better Auth **1.7.16**, Drizzle ORM **0.45.4**, Resend **6.37.0**. The admin plugin configuration and schema were checked against the installed Better Auth implementation. `npm ci` installs the reviewed lockfile.

## Production deployment and configuration

Vercel project: `aces-careers` in the `aces-intelligence` team. Preserve the existing project, domain, database, authentication secret and Blob connection.

| Variable                | Purpose                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `TURSO_DATABASE_URL`    | Dedicated remote careers Turso database (`libsql://...`)                                                |
| `TURSO_AUTH_TOKEN`      | Token for that database                                                                                 |
| `BETTER_AUTH_SECRET`    | Existing secret; at least 32 random characters for a new environment                                    |
| `BETTER_AUTH_URL`       | `https://careers.acesintelligence.xyz` in production; exact local origin in development                 |
| `BLOB_READ_WRITE_TOKEN` | Existing **private** resumes Blob store token                                                           |
| `RESEND_API_KEY`        | Server-only Resend API key                                                                              |
| `RESEND_FROM_EMAIL`     | Plain verified sender address, e.g. `careers@acesintelligence.xyz`                                      |
| `CAREERS_ADMIN_EMAIL`   | Recruitment recipient; defaults to `acesintelligenceph@gmail.com`                                       |
| `CAREERS_SITE_URL`      | Absolute HTTPS portal origin used for email links; production is `https://careers.acesintelligence.xyz` |

Use separate preview/test databases and Blob stores. Never point tests at production. Preview notification settings must target a controlled test inbox; omit `RESEND_API_KEY` if a preview must not send email.

`npm run build` retains the existing workflow: apply tracked Drizzle migrations when a database URL exists, then build Next.js. Missing database configuration leaves public pages available with an explicit setup notice. Failed migrations fail the build. Next.js `after()` runs the email attempt after the application response on Vercel; the durable queue remains available for manual retry if execution is interrupted. No cron, extra worker or separate integration is required.

Before merging/deploying, review the migration, run the checks below, verify the mobile layouts in a real browser and verify the email sender. A build with no database URL **does not** migrate production. Production environment variables must be configured through Vercel; do not overwrite existing secrets.

## Database migration

Migration `drizzle/0001_thick_kree.sql` is additive:

- `applicants`: `role` (default `user`), `banned` (default false), `ban_reason`, `ban_expires`.
- `sessions`: nullable `impersonated_by` for Better Auth's admin plugin.
- `application_emails`: one row per application, delivery state, frozen email payload, attempt timestamps/count, provider receipt and safe error code.

No users, accounts, passwords, resumes, jobs or applications are deleted or rewritten. Existing users stay ordinary applicants. The unique applicant/job index is unchanged. Existing applications are **not** retroactively emailed.

Apply the migration against the intended database using its configured environment:

```sh
npm run db:migrate
```

Drizzle's journal makes this idempotent. Do not use database reset or schema-push commands. The migration test upgrades a populated original-schema database and verifies records and the unique constraint survive. The application and its email queue record are inserted in the same transaction.

## How to Add an Admin

1. Sign up through the normal signup page.
2. In a trusted terminal configured for the same Turso database, apply migrations and run:

   ```sh
   npm run admin:promote -- someone@example.com
   ```

3. Log in using the account's existing credentials.
4. Visit `/admin`.

The script matches an existing email case-insensitively, refuses missing/ambiguous users and is safe to run repeatedly. It does not create credentials or replace the password. No admin emails or passwords are hardcoded. A resume is not required to use `/admin` after promotion.

## Recruitment management

- **Overview:** total applications, awaiting review (`submitted`), shortlisted, hired and active job counts.
- **Applications:** search applicant name/email or job title; filter status; 25 records per page. Download links require an administrator session and serve the submitted private resume as an attachment. Raw Blob URLs are not sent to the admin table.
- Statuses: `submitted`, `reviewing`, `shortlisted`, `hired`, `not_selected`.
- **Jobs:** create/edit the existing job fields; activate to publish; deactivate to close. Deactivation preserves application history. There is no job-delete action.
- Optional `npm run db:seed` creates three **inactive** templates; activating genuine vacancies is an explicit admin action.

## Resend setup

1. Create/open the organization's Resend account and add the ACES sending domain.
2. Add the DNS records provided by Resend to the domain's DNS provider. Wait for Resend to confirm verification.
3. Create an API key with sending access and store it as `RESEND_API_KEY` in Vercel. Set `RESEND_FROM_EMAIL` to a verified-domain address, `CAREERS_ADMIN_EMAIL` to the recruitment inbox and `CAREERS_SITE_URL` to the deployed HTTPS origin.
4. Redeploy to load the environment. `/admin` shows whether the required values are present; this is **not** proof of domain verification or delivery.
5. Submit a controlled application in a test environment, verify the inbox and Resend delivery logs, and check the email's authenticated application-review link. Queue state `sent` means Resend accepted the request, not proof of inbox delivery.

The message includes the applicant's name/email, position, submission time in `Asia/Manila` and an absolute link to `/admin/applications?id=...`. It contains an escaped HTML template and a plain-text alternative. Resumes are not publicly attached or linked.

Official references: [Better Auth admin plugin](https://www.better-auth.com/docs/plugins/admin), [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction), [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys).

### Failures and safe retries

- With missing configuration, applications are still saved; email rows remain `pending` and the dashboard displays setup guidance.
- A new application schedules one send. Duplicate Apply requests return 409 and do not enqueue another notification.
- The full payload is frozen on the first attempt and retries reuse the same provider idempotency key. Dashboard refreshes never send messages.
- Authorized admins can choose **Retry notification** for pending, failed or interrupted sends. Retries are limited to one attempt per application per minute and 20 retry requests per admin per hour.
- Resend's idempotency protection lasts 24 hours. After **23 hours from the first attempt**, retry stops with `needs_review` to avoid a duplicate after an uncertain response. Inspect Resend's logs and reconcile delivery manually; the portal deliberately has no force-send button that bypasses this safeguard. Notifications that never attempted delivery due to missing configuration can still be sent later.
- Provider errors are not logged verbatim. Logs omit applicant data, email payloads and credentials. The stored payload contains applicant information and should follow the same retention policy as applications.

Password recovery and email-verification delivery remain unconfigured, matching the existing portal. Talent-pool opt-in records consent only. Maintain the existing retention/deletion process for applicant records and private uploads.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:integration
```

- Unit/database tests cover input validation, email HTML escaping, Manila dates, missing credentials, concurrent delivery, frozen-payload retries, expiry, additive migration safety and idempotent admin promotion.
- HTTP integration tests start a production Next.js server on port 3198 against a temporary database. They cover signup/login/logout, public browsing, resume gating, forged roles, admin 401/403, status changes, jobs, closed details/history, duplicate applications/queue entries, cross-origin writes, search and role demotion.
- Test emails use a fake sender; **no real email is sent**. Resume fixtures do not validate external Blob connectivity. Real sender verification, inbox delivery and private-Blob downloads require configured services.
- For streamed Next.js responses, a not-found page may use HTTP 200 after response headers are committed. Tests assert that inactive jobs render the not-found screen and disclose no role details; the application API returns 404 for inactive jobs.

See [implementation notes](docs/recruitment-release.md) for the file list and verification limits.

## Hourly job rates

Admins can enter optional PHP and USD hourly rates when creating or editing jobs. Either or both can be published; blank fields hide the rate. Values are independent, with no exchange-rate conversion. Rates support two decimal places and are stored as integer centavos/cents. Migration `0002_careless_cardiac.sql` adds two nullable columns; existing listings keep rates unset.

Job headers accept an optional public HTTPS image URL in the admin form. They appear on cards and detail pages; empty or failed images are hidden. No upload service or image proxy is added.
