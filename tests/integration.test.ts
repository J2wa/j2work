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
      const unauth = await fetch(origin + "/careers", { redirect: "manual" });
      assert.ok(
        unauth.headers.get("location")?.endsWith("/login") ||
          (await unauth.text()).includes("url=/login"),
        "Unauthenticated careers redirects to login",
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
      const gated = await fetch(origin + "/careers", {
        headers: { Cookie: cookie },
        redirect: "manual",
      });
      assert.ok(
        gated.headers.get("location")?.endsWith("/onboarding") ||
          (await gated.text()).includes("url=/onboarding"),
        "Incomplete profile redirects to onboarding",
      );
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
