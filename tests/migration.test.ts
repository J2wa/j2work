import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  copyFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
test("Upgrade preserves existing users, credentials, resumes, jobs, applications and unique constraint; promotion is idempotent", async () => {
  const directory = await mkdtemp(join(tmpdir(), "aces-migration-test-"));
  const url = `file:${join(directory, "legacy.db")}`;
  const client = createClient({ url });
  try {
    const old = join(directory, "drizzle");
    await mkdir(join(old, "meta"), { recursive: true });
    const journal = JSON.parse(
      await readFile("drizzle/meta/_journal.json", "utf8"),
    );
    journal.entries = journal.entries.slice(0, 1);
    await writeFile(join(old, "meta/_journal.json"), JSON.stringify(journal));
    await copyFile(
      "drizzle/0000_green_adam_warlock.sql",
      join(old, "0000_green_adam_warlock.sql"),
    );
    await migrate(drizzle(client), { migrationsFolder: old });
    await client.execute(
      "INSERT INTO applicants (id,full_name,email,preferred_work_setting,resume_url,created_at,updated_at) VALUES ('a','Existing User','existing@example.com','Part-Time','private-resume',0,0)",
    );
    await client.execute(
      "INSERT INTO accounts (id,account_id,provider_id,user_id,password,created_at,updated_at) VALUES ('account','a','credential','a','existing-password-hash',0,0)",
    );
    await client.execute(
      "INSERT INTO jobs (id,title,department,role_type,work_setting,location,summary,description,requirements,created_at) VALUES ('j','Existing Job','QA','QA','Part-Time','PH','Summary','Description','Requirements',0)",
    );
    await client.execute(
      "INSERT INTO applications (id,applicant_id,job_id,resume_url,submitted_at) VALUES ('application','a','j','submitted-resume',0)",
    );
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    const row = (await client.execute("SELECT * FROM applicants")).rows[0];
    assert.equal(row.role, "user");
    assert.equal(row.resume_url, "private-resume");
    assert.equal(
      (await client.execute("SELECT password FROM accounts")).rows[0].password,
      "existing-password-hash",
    );
    assert.equal(
      (await client.execute("SELECT resume_url FROM applications")).rows[0]
        .resume_url,
      "submitted-resume",
    );
    assert.equal(
      (await client.execute("SELECT COUNT(*) AS n FROM application_emails"))
        .rows[0].n,
      0,
      "Do not retroactively notify for old applications",
    );
    await assert.rejects(
      client.execute(
        "INSERT INTO applications (id,applicant_id,job_id,resume_url,submitted_at) VALUES ('duplicate','a','j','another',0)",
      ),
    );
    const run = (email: string) =>
      spawnSync(
        process.execPath,
        ["--import", "tsx", "scripts/promote-admin.ts", email],
        {
          env: {
            ...process.env,
            TURSO_DATABASE_URL: url,
            TURSO_AUTH_TOKEN: "",
            VERCEL: "",
          },
          encoding: "utf8",
        },
      );
    assert.equal(run("missing@example.com").status, 1);
    assert.equal(run("not-an-email").status, 1);
    for (let i = 0; i < 2; i++) {
      const result = run("EXISTING@example.com");
      assert.equal(result.status, 0, result.stderr);
    }
    assert.equal(
      (await client.execute("SELECT role FROM applicants")).rows[0].role,
      "admin",
    );
    assert.equal(
      (await client.execute("SELECT password FROM accounts")).rows[0].password,
      "existing-password-hash",
    );
  } finally {
    client.close();
    await rm(directory, { recursive: true, force: true });
  }
});
