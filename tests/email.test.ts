import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { recruitmentEmail } from "../lib/email-template";
import { jobSchema, statusSchema } from "../lib/validation";

test("Email escapes applicant HTML and keeps plain text, Manila date and review link", () => {
  const email = recruitmentEmail({
    name: '<img src=x onerror="bad()">',
    email: "a@example.com",
    title: "QA & AI",
    submittedAt: new Date("2026-01-01T00:00:00Z"),
    reviewUrl: "https://careers.example/admin/applications?id=1&x=2",
  });
  assert.ok(!email.html.includes("<img"));
  assert.match(email.html, /&lt;img/);
  assert.match(email.html, /QA &amp; AI/);
  assert.match(email.html, /id=1&amp;x=2/);
  assert.match(email.text, /08:00|8:00/);
  assert.match(email.text, /Asia\/Manila/);
  assert.match(email.text, /QA & AI/);
});
test("Admin input rejects extra fields, malformed jobs and unsupported statuses", () => {
  assert.equal(statusSchema.safeParse({ status: "accepted" }).success, false);
  assert.equal(
    statusSchema.safeParse({ status: "hired", applicantId: "other" }).success,
    false,
  );
  assert.equal(
    jobSchema.safeParse({ title: "X", isActive: true }).success,
    false,
  );
});
test("Durable email delivery: config, deduplication, retries, payload stability and expiry", async () => {
  const directory = await mkdtemp(join(tmpdir(), "aces-email-test-"));
  const url = `file:${join(directory, "email.db")}`;
  process.env.TURSO_DATABASE_URL = url;
  delete process.env.TURSO_AUTH_TOKEN;
  delete process.env.VERCEL;
  delete process.env.RESEND_API_KEY;
  const client = createClient({ url });
  try {
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    await client.execute(
      "INSERT INTO applicants (id,full_name,email,preferred_work_setting,created_at,updated_at) VALUES ('a','Applicant','a@example.com','Part-Time',0,0)",
    );
    await client.execute(
      "INSERT INTO jobs (id,title,department,role_type,work_setting,location,summary,description,requirements,created_at) VALUES ('j','Test job','QA','QA','Part-Time','PH','Summary','Description','Requirement',0)",
    );
    for (const id of ["one", "two", "three"]) {
      await client
        .execute({
          sql: "INSERT INTO applications (id,applicant_id,job_id,resume_url,submitted_at) VALUES (?, 'a', ?, 'private-resume', 0)",
          args: [id, "j" + (id === "one" ? "" : id)],
        })
        .catch(async () => {
          await client.execute({
            sql: "INSERT INTO jobs (id,title,department,role_type,work_setting,location,remote,summary,description,requirements,is_active,created_at) SELECT ?,title,department,role_type,work_setting,location,remote,summary,description,requirements,is_active,created_at FROM jobs WHERE id='j'",
            args: ["j" + id],
          });
          await client.execute({
            sql: "INSERT INTO applications (id,applicant_id,job_id,resume_url,submitted_at) VALUES (?, 'a', ?, 'private-resume', 0)",
            args: [id, "j" + id],
          });
        });
      await client.execute({
        sql: "INSERT INTO application_emails (application_id) VALUES (?)",
        args: [id],
      });
    }
    const { deliverApplicationEmail, RETRY_WINDOW_MS } =
      await import("../lib/email");
    let calls = 0;
    const delivered: { payload: unknown; key: string }[] = [];
    const sender = async (payload: unknown, key: string) => {
      calls++;
      delivered.push({ payload, key });
      return { data: { id: "provider-1" }, error: null };
    };
    await deliverApplicationEmail("one", sender);
    assert.equal(calls, 0);
    let row = (
      await client.execute(
        "SELECT * FROM application_emails WHERE application_id='one'",
      )
    ).rows[0];
    assert.equal(row.state, "pending");
    assert.equal(row.error_code, "not_configured");
    assert.equal(row.first_attempt_at, null);
    process.env.RESEND_API_KEY = "test-placeholder-never-sent";
    process.env.RESEND_FROM_EMAIL = "careers@example.com";
    process.env.CAREERS_ADMIN_EMAIL = "recruitment@example.com";
    process.env.CAREERS_SITE_URL = "https://careers.example.com";
    await Promise.all([
      deliverApplicationEmail("one", sender),
      deliverApplicationEmail("one", sender),
    ]);
    await deliverApplicationEmail("one", sender);
    assert.equal(calls, 1);
    row = (
      await client.execute(
        "SELECT * FROM application_emails WHERE application_id='one'",
      )
    ).rows[0];
    assert.equal(row.state, "sent");
    assert.equal(row.provider_id, "provider-1");
    assert.equal(row.attempts, 1);
    const failing = async (payload: unknown, key: string) => {
      delivered.push({ payload, key });
      return { data: null, error: { message: "Simulated provider failure" } };
    };
    await deliverApplicationEmail("two", failing);
    assert.equal(
      (
        await client.execute(
          "SELECT state FROM application_emails WHERE application_id='two'",
        )
      ).rows[0].state,
      "failed",
    );
    assert.equal(
      (await client.execute("SELECT COUNT(*) AS n FROM applications")).rows[0]
        .n,
      3,
    );
    await client.execute("UPDATE applicants SET full_name='Changed Applicant'");
    await client.execute("UPDATE jobs SET title='Changed Title'");
    await client.execute({
      sql: "UPDATE application_emails SET last_attempt_at=? WHERE application_id='two'",
      args: [Date.now() - 61000],
    });
    await deliverApplicationEmail("two", sender);
    assert.deepEqual(
      delivered[1],
      delivered[2],
      "Retries use identical payload and key",
    );
    await deliverApplicationEmail("three", failing);
    await client.execute({
      sql: "UPDATE application_emails SET first_attempt_at=?,last_attempt_at=? WHERE application_id='three'",
      args: [Date.now() - RETRY_WINDOW_MS - 1000, Date.now() - 61000],
    });
    const count = calls;
    await deliverApplicationEmail("three", sender);
    assert.equal(calls, count);
    assert.equal(
      (
        await client.execute(
          "SELECT state FROM application_emails WHERE application_id='three'",
        )
      ).rows[0].state,
      "needs_review",
    );
  } finally {
    client.close();
    await rm(directory, { recursive: true, force: true });
  }
});
