import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
const origin = "http://127.0.0.1:3198";
test(
  "HTTP flow: signup, incomplete profile, application ownership and duplicate protection",
  { timeout: 120000 },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "aces-careers-test-"));
    const url = `file:${join(directory, "test.db")}`;
    const client = createClient({ url });
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    const child = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--port",
        "3198",
        "--hostname",
        "127.0.0.1",
      ],
      {
        env: {
          ...process.env,
          TURSO_DATABASE_URL: url,
          BETTER_AUTH_SECRET: randomBytes(48).toString("hex"),
          BETTER_AUTH_URL: origin,
          NODE_ENV: "production",
          RESEND_API_KEY: "",
          TURSO_AUTH_TOKEN: "",
          VERCEL: "",
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    const post = (
      path: string,
      body: unknown,
      cookie = "",
      requestOrigin = origin,
    ) =>
      fetch(origin + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: requestOrigin,
          Cookie: cookie,
        },
        body: JSON.stringify(body),
        redirect: "manual",
      });
    try {
      let ready = false;
      for (let i = 0; i < 60; i++) {
        if (child.exitCode !== null) throw new Error(output);
        try {
          const r = await fetch(origin, { signal: AbortSignal.timeout(2000) });
          if (r.ok) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 500));
      }
      assert.ok(ready, output);
      const unauth = await fetch(origin + "/careers");
      assert.equal(unauth.status, 200, "Active jobs are publicly browsable");
      assert.match(await unauth.text(), /No open positions right now/);
      const privatePage = await fetch(origin + "/careers/applications", {
        redirect: "manual",
      });
      assert.ok(
        privatePage.headers.get("location")?.endsWith("/login") ||
          (await privatePage.text()).includes("url=/login"),
      );
      const invalid = await post("/api/auth/sign-up/email", {
        name: "A",
        email: "bad",
        password: "short",
      });
      assert.equal(invalid.status, 400);
      const input = {
        name: "Test Applicant",
        email: "test-flow@example.com",
        phone: "",
        password: "test-only-long-password",
        preferredWorkSetting: "Part-Time",
        referredBy: "",
        talentPoolOptIn: false,
      };
      const forgedResume = await post("/api/auth/sign-up/email", {
        ...input,
        resumeUrl: "https://attacker.example/resume.pdf",
      });
      assert.equal(forgedResume.status, 400);
      const signup = await post("/api/auth/sign-up/email", input);
      const signupBody = await signup.json();
      assert.equal(signup.status, 200, JSON.stringify(signupBody));
      const cookie = signup.headers
        .getSetCookie()
        .map((c) => c.split(";")[0])
        .join("; ");
      assert.ok(cookie.includes("session_token"));
      const id = signupBody.user.id;
      const stored = await client.execute({
        sql: "SELECT resume_url,email FROM applicants WHERE id=?",
        args: [id],
      });
      assert.equal(
        stored.rows[0].resume_url,
        null,
        "Client cannot set trusted resume URL",
      );
      const gated = await fetch(origin + "/careers/profile", {
        headers: { Cookie: cookie },
        redirect: "manual",
      });
      assert.ok(
        gated.headers.get("location")?.endsWith("/onboarding") ||
          (await gated.text()).includes("url=/onboarding"),
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT role FROM applicants WHERE id=?",
            args: [id],
          })
        ).rows[0].role,
        "user",
      );
      const anonymousAdmin = await post("/api/admin/jobs", {});
      assert.equal(anonymousAdmin.status, 401);
      assert.equal((await post("/api/admin/job-images", {})).status, 401);
      assert.equal((await post("/api/admin/job-images", {}, cookie)).status, 403);
      assert.equal((await fetch(origin + "/api/job-images/resume.pdf")).status, 404);
      assert.equal((await post("/api/admin/jobs", {}, cookie)).status, 403);
      assert.equal(
        (
          await post(
            "/api/auth/admin/set-role",
            { userId: id, role: "admin" },
            cookie,
          )
        ).status,
        403,
      );
      const forbiddenPage = await fetch(origin + "/admin", {
        headers: { Cookie: cookie },
      });
      assert.match(await forbiddenPage.text(), /Administrator access required/);
      const before = await post(
        "/api/applications",
        { jobId: "test-job" },
        cookie,
      );
      assert.equal(before.status, 422);
      // The test fixture simulates a previously verified upload. Storage itself is
      // separately checked by unit tests; no external storage is accessed here.
      await client.execute({
        sql: "UPDATE applicants SET resume_url=?,resume_name=? WHERE id=?",
        args: [
          "https://fixture.private.blob.vercel-storage.com/resume.pdf",
          "resume.pdf",
          id,
        ],
      });
      await client.execute({
        sql: "INSERT INTO jobs (id,title,department,role_type,work_setting,location,remote,summary,description,requirements,is_active,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        args: [
          "test-job",
          "Test role",
          "Quality",
          "QA",
          "Part-Time",
          "Philippines",
          1,
          "Test summary",
          "Test description",
          "Test requirements",
          1,
          Date.now(),
        ],
      });
      const dashboard = await fetch(origin + "/careers", {
        headers: { Cookie: cookie },
      });
      assert.equal(dashboard.status, 200);
      assert.match(await dashboard.text(), /Test role/);
      const anonymous = await post("/api/applications", { jobId: "test-job" });
      assert.equal(anonymous.status, 401);
      const forged = await post(
        "/api/applications",
        { jobId: "test-job" },
        cookie,
        "https://attacker.example",
      );
      assert.equal(forged.status, 403);
      const responses = await Promise.all([
        post(
          "/api/applications",
          {
            jobId: "test-job",
            coverNote: "First application",
            applicantId: "someone-else",
          },
          cookie,
        ),
        post("/api/applications", { jobId: "test-job" }, cookie),
      ]);
      assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
      const records = await client.execute(
        "SELECT applicant_id,resume_url FROM applications",
      );
      assert.equal(records.rows.length, 1);
      assert.equal(records.rows[0].applicant_id, id);
      const profile = await fetch(origin + "/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          Cookie: cookie,
        },
        body: JSON.stringify({
          ...input,
          name: "Updated Applicant",
          talentPoolOptIn: true,
        }),
      });
      assert.equal(profile.status, 200);
      const login = await post("/api/auth/sign-in/email", {
        email: input.email,
        password: input.password,
      });
      assert.equal(login.status, 200);
      await client.execute("DELETE FROM rate_limits");
      const second = await post("/api/auth/sign-up/email", {
        ...input,
        email: "second@example.com",
      });
      assert.equal(second.status, 200);
      const secondCookie = second.headers
        .getSetCookie()
        .map((c) => c.split(";")[0])
        .join("; ");
      assert.equal(
        (
          await fetch(origin + "/api/resume/download", {
            headers: { Cookie: secondCookie },
          })
        ).status,
        404,
      );
      const duplicate = await post("/api/auth/sign-up/email", {
        ...input,
        email: input.email.toUpperCase(),
      });
      assert.notEqual(duplicate.status, 200);
      const mutate = (
        path: string,
        body: unknown,
        who = cookie,
        requestOrigin = origin,
      ) =>
        fetch(origin + path, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Origin: requestOrigin,
            Cookie: who,
          },
          body: JSON.stringify(body),
        });
      const applicationId = String(
        (await client.execute("SELECT id FROM applications")).rows[0].id,
      );
      const queued = await client.execute("SELECT * FROM application_emails");
      assert.equal(
        queued.rows.length,
        1,
        "Duplicate apply creates only one notification",
      );
      assert.equal(
        queued.rows[0].state,
        "pending",
        "Unconfigured email does not invalidate applications",
      );
      assert.equal(
        (
          await mutate(
            `/api/admin/applications/${applicationId}`,
            { status: "hired" },
            secondCookie,
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await fetch(
            origin + `/api/admin/applications/${applicationId}/resume`,
            { headers: { Cookie: secondCookie } },
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await post(
            `/api/admin/applications/${applicationId}/email`,
            {},
            secondCookie,
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await mutate(
            "/api/profile",
            { ...input, role: "admin" },
            secondCookie,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await client.execute(
            "SELECT role FROM applicants WHERE email='second@example.com'",
          )
        ).rows[0].role,
        "user",
        "Profile cannot elevate privileges",
      );
      await client.execute("DELETE FROM rate_limits");
      const forgedAdmin = await post("/api/auth/sign-up/email", {
        ...input,
        email: "forged-admin@example.com",
        role: "admin",
        banned: false,
      });
      if (forgedAdmin.ok)
        assert.equal(
          (
            await client.execute(
              "SELECT role FROM applicants WHERE email='forged-admin@example.com'",
            )
          ).rows[0].role,
          "user",
        );
      else assert.equal(forgedAdmin.status, 400);
      // Promote an existing account; its credentials and existing session survive.
      await client.execute({
        sql: "UPDATE applicants SET role='admin' WHERE id=?",
        args: [id],
      });
      const adminPage = await fetch(origin + "/admin", {
        headers: { Cookie: cookie },
      });
      assert.equal(adminPage.status, 200);
      assert.match(await adminPage.text(), /Dashboard/);
      const invalidImage = new FormData();
      invalidImage.append("image", new Blob(["not a real image"], { type: "image/png" }), "fake.png");
      assert.equal((await fetch(origin + "/api/admin/job-images", { method: "POST", headers: { Cookie: cookie, Origin: origin }, body: invalidImage })).status, 400);
      const jobInput = {
        hourlyRatePhpCents: 25050,
        hourlyRateUsdCents: 500,
        title: "Admin created role",
        department: "Engineering",
        roleType: "Developer",
        workSetting: "Part-Time",
        location: "Philippines",
        remote: true,
        summary: "Summary",
        description: "Description",
        requirements: "Experience",
        isActive: true,
      };
      const created = await post("/api/admin/jobs", jobInput, cookie);
      assert.equal(created.status, 201);
      const createdJob = (await created.json()).job;
      const jobId = createdJob.id;
      assert.equal(createdJob.hourlyRatePhpCents, 25050);
      assert.equal(createdJob.hourlyRateUsdCents, 500);
      assert.match(
        await (await fetch(origin + `/careers/jobs/${jobId}`)).text(),
        /PHP 250.50\/hr/,
      );
      assert.equal(
        (
          await post(
            "/api/admin/jobs",
            { ...jobInput, hourlyRatePhpCents: -1 },
            cookie,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await mutate(`/api/admin/jobs/${jobId}`, {
            ...jobInput,
            hourlyRatePhpCents: null,
            hourlyRateUsdCents: null,
          })
        ).status,
        200,
      );
      const cleared = await client.execute({
        sql: "SELECT hourly_rate_php_cents, hourly_rate_usd_cents FROM jobs WHERE id=?",
        args: [jobId],
      });
      assert.equal(cleared.rows[0].hourly_rate_php_cents, null);
      assert.equal(cleared.rows[0].hourly_rate_usd_cents, null);
      assert.equal(
        (
          await mutate(`/api/admin/jobs/${jobId}`, {
            ...jobInput,
            title: "Updated role",
          })
        ).status,
        200,
      );
      assert.equal(
        (await mutate(`/api/admin/jobs/${jobId}`, { isActive: false })).status,
        200,
      );
      assert.equal(
        (
          await mutate(
            `/api/admin/jobs/${jobId}`,
            { isActive: true },
            secondCookie,
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await mutate(
            `/api/admin/jobs/${jobId}`,
            { isActive: true },
            cookie,
            "https://attacker.example",
          )
        ).status,
        403,
      );
      const hidden = await (
        await fetch(origin + `/careers/jobs/${jobId}`)
      ).text();
      assert.match(hidden, /This path ends here/);
      assert.doesNotMatch(hidden, /Updated role/);
      const closed = await mutate("/api/admin/jobs/test-job", {
        isActive: false,
      });
      assert.equal(closed.status, 200);
      const closedDetails = await (
        await fetch(origin + "/careers/jobs/test-job", {
          headers: { Cookie: cookie },
        })
      ).text();
      assert.match(closedDetails, /This path ends here/);
      assert.doesNotMatch(
        closedDetails,
        /Test role/,
        "Closed details hidden even from prior applicants",
      );
      assert.equal(
        (await post("/api/applications", { jobId: "test-job" }, cookie)).status,
        404,
      );
      assert.doesNotMatch(
        await (await fetch(origin + "/careers")).text(),
        /Updated role|Test role/,
      );
      assert.match(
        await (
          await fetch(origin + "/careers/applications", {
            headers: { Cookie: cookie },
          })
        ).text(),
        /Test role/,
      );
      assert.equal(
        (
          await mutate(`/api/admin/applications/${applicationId}`, {
            status: "accepted",
          })
        ).status,
        400,
      );
      for (const status of [
        "reviewing",
        "shortlisted",
        "hired",
        "not_selected",
        "submitted",
      ]) {
        assert.equal(
          (await mutate(`/api/admin/applications/${applicationId}`, { status }))
            .status,
          200,
        );
        assert.equal(
          (
            await client.execute({
              sql: "SELECT status FROM applications WHERE id=?",
              args: [applicationId],
            })
          ).rows[0].status,
          status,
        );
      }
      assert.equal(
        (
          await post(
            `/api/admin/applications/${applicationId}/email`,
            {},
            cookie,
          )
        ).status,
        503,
      );
      const search = await fetch(
        origin + "/admin/applications?q=Updated&status=submitted",
        { headers: { Cookie: cookie } },
      );
      assert.match(await search.text(), /Updated Applicant/);
      const noMatches = await fetch(
        origin + "/admin/applications?q=NoSuchName",
        { headers: { Cookie: cookie } },
      );
      assert.match(await noMatches.text(), /No applications found/);
      const ownSecondHistory = await fetch(origin + "/careers/applications", {
        headers: { Cookie: secondCookie },
        redirect: "manual",
      });
      assert.doesNotMatch(await ownSecondHistory.text(), /First application/);
      await client.execute({
        sql: "UPDATE applicants SET role='user' WHERE id=?",
        args: [id],
      });
      assert.equal(
        (
          await mutate(`/api/admin/applications/${applicationId}`, {
            status: "hired",
          })
        ).status,
        403,
        "Demotion revokes admin access for current session",
      );
      const logout = await post("/api/auth/sign-out", {}, cookie);
      assert.equal(logout.status, 200);
      const stale = await post(
        "/api/applications",
        { jobId: "test-job" },
        cookie,
      );
      assert.equal(stale.status, 401);
    } catch (error) {
      console.error(output);
      throw error;
    } finally {
      child.kill("SIGTERM");
      await new Promise((resolve) => {
        if (child.exitCode !== null) resolve(null);
        else child.once("exit", resolve);
      });
      client.close();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
