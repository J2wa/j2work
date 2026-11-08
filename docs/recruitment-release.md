# Recruitment release notes

## Implemented

Blue-and-white design tokens and responsive styles across public, authentication, applicant and admin pages; a smaller landing page; public active-only careers browsing with direct Apply buttons; exact-role server authorization using Better Auth admin; recruitment overview, application search/status updates/private submitted-resume downloads; job creation/editing/activation; additive migration and promotion CLI; recruitment-only Resend notifications with a durable retry queue.

Applicant confirmation/status emails and confirmation resends are intentionally deferred to keep the first release simple. Existing resume upload, authentication, consent and application history behavior is preserved.

## Validation

- ESLint: passed with no warnings.
- TypeScript: passed.
- Unit/database tests: 8 passed.
- Production build: passed without production credentials.
- Production HTTP integration: passed against an isolated temporary database.
- Tests send no real email and do not access production data.
- Browser QA at 320, 375, 768 and desktop widths remains unverified. The managed preview runner passes `--host` and `--strictPort`, which Next.js does not support; it exits before serving. Responsive styles were reviewed, but that is not a substitute for browser testing.
- Live Resend delivery and private Blob downloads require configured services and remain unverified.
- No production migration, admin promotion or production deployment was performed during implementation.

## Files

- `.env.example`
- `README.md`
- `app/api/applications/route.ts`
- `app/api/auth/[...all]/route.ts`
- `app/careers/applications/page.tsx`
- `app/careers/jobs/[id]/page.tsx`
- `app/careers/layout.tsx`
- `app/careers/page.tsx`
- `app/globals.css`
- `app/icon.svg`
- `app/page.tsx`
- `components/auth-shell.tsx`
- `components/job-board.tsx`
- `components/login-form.tsx`
- `drizzle/meta/_journal.json`
- `lib/auth-client.ts`
- `lib/auth.ts`
- `lib/db/schema.ts`
- `lib/limits.ts`
- `lib/validation.ts`
- `next.config.ts`
- `package-lock.json`
- `package.json`
- `postcss.config.mjs`
- `tests/integration.test.ts`
- `app/admin/applications/page.tsx`
- `app/admin/jobs/page.tsx`
- `app/admin/layout.tsx`
- `app/admin/loading.tsx`
- `app/admin/page.tsx`
- `app/api/admin/applications/[id]/email/route.ts`
- `app/api/admin/applications/[id]/resume/route.ts`
- `app/api/admin/applications/[id]/route.ts`
- `app/api/admin/jobs/[id]/route.ts`
- `app/api/admin/jobs/route.ts`
- `app/forbidden.tsx`
- `components/admin-applications.tsx`
- `components/admin-jobs.tsx`
- `components/admin-nav.tsx`
- `components/apply-button.tsx`
- `drizzle/0001_thick_kree.sql`
- `drizzle/meta/0001_snapshot.json`
- `eslint.config.mjs`
- `lib/admin.ts`
- `lib/email-template.ts`
- `lib/email.ts`
- `scripts/promote-admin.ts`
- `tests/email.test.ts`
- `tests/migration.test.ts`
- `docs/recruitment-release.md`
