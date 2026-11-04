# ACES Careers

Applicant onboarding and careers portal for ACES Intelligence. Next.js App Router, React, Tailwind CSS, Turso/libSQL, Drizzle ORM, Better Auth, and private Vercel Blob storage.

## Features

- Two-step signup: full name, unique normalized email, optional phone/referral, work preference, optional talent-pool consent, password, and required resume.
- Password authentication with database-backed rate limits, secure cookies, and server-side session verification.
- Resumable onboarding: an account created before a failed upload can log in and finish later. Careers pages and applications require a verified resume.
- Direct-to-private-storage PDF/DOCX uploads up to 5 MiB, real transfer progress, server-side file signature/structure checks, immutable paths, authenticated downloads, and upload quotas.
- Authenticated search/filter by department, role type, and work setting; full role details and optional cover note.
- Transactional applications with a unique applicant/job constraint. Each application retains its submitted resume version.
- Application history, status display, editable profile, resume replacement, and talent-pool consent management.
- Mobile layouts, keyboard-accessible controls, inline validation, notifications, loading/error/empty states, and applicant privacy notice.

## Production deployment

Vercel project: `aces-careers` in the `aces-intelligence` team.
Domain: `https://careers.acesintelligence.xyz`.
Repository: `https://github.com/J2wa/j2work`.

Required environment variables:

| Variable                | Purpose                                                                        |
| ----------------------- | ------------------------------------------------------------------------------ |
| `TURSO_DATABASE_URL`    | Dedicated remote Turso database URL (`libsql://...`)                           |
| `TURSO_AUTH_TOKEN`      | Token for that database                                                        |
| `BETTER_AUTH_SECRET`    | At least 32 random characters, generated securely                              |
| `BETTER_AUTH_URL`       | `https://careers.acesintelligence.xyz` in Production; local URL in development |
| `BLOB_READ_WRITE_TOKEN` | Token injected by connecting the private resumes Blob store                    |

Use Vercel project **Storage → Create Database → Turso**, then connect a dedicated careers database to the project. Turso's integration must supply the two `TURSO_*` variables above. Do not reuse the employee workplace database. Use separate development/preview databases and storage when those environments will collect test data. Do not put secrets in Git.

`npm run build` applies tracked Drizzle migrations when a database URL is present, then builds Next.js. After connecting Turso, redeploy to initialize tables. Without a database URL, the landing page deploys, signup/login show a preparation notice, and `/api/health` returns 503. This is an explicit setup state, not a fake working portal. A migration or database connection error fails the deployment. `/api/health` returns 200 with `{"status":"ready"}` when tables and required credentials are configured; verify an actual upload separately.

The private Blob store is `aces-careers-resumes`. Browser uploads go directly to Blob, avoiding Vercel's function request-size limit. The completion endpoint independently checks ownership, expiry, size, and content before trusting the stored URL. All resume downloads are attachments and require a session. Updating a resume preserves older versions used by applications.

## Local setup

```sh
npm ci
cp .env.example .env.local
# Generate BETTER_AUTH_SECRET locally and add private Blob credentials securely.
npm run db:migrate
npm run dev
```

For local data, use `TURSO_DATABASE_URL=file:./careers.db`. Production explicitly rejects file URLs on Vercel. Local signup works with SQLite; resume uploads require the connected private Blob store.

## Jobs and application statuses

No vacancies are automatically published. Optional `npm run db:seed` creates three **inactive** templates. Edit the job descriptions, requirements, location, role type, work setting, and terms in Turso's SQL editor, then set `is_active=1` for genuine vacancies. `requirements` contains one requirement per line. Use UUIDs or stable slug IDs for new jobs. Close a vacancy with `is_active=0`; applicants can still view roles they applied to.

Authorized hiring staff can update an application's `status` in the database: `submitted`, `reviewing`, `shortlisted`, `hired`, or `not_selected`. This version is an applicant portal; a recruiter administration interface is not included. Talent-pool opt-in records consent only; it does not send emails or create a campaign.

Before a hiring campaign, confirm the applicant notice and establish a retention/deletion process. Delete expired abandoned uploads and obsolete resumes on an operational schedule, preserving any referenced by existing applications. Password recovery and email verification delivery are not configured; the UI directs account-access problems to ACES support.

## Checks

```sh
npm run typecheck
npm test
npm run build
npm run test:integration
```

Integration tests start a production Next.js server on port 3198 against an isolated temporary libSQL database. They check signup/login/logout, authentication redirects, incomplete-profile gating, injected resume URL rejection, cross-origin protection, concurrent duplicate applications, ownership, and consent updates. The upload is represented by an explicitly documented local fixture; it does not claim to test external Blob connectivity.
