import test from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import {
  signupSchema,
  resumeError,
  applicationSchema,
  MAX_RESUME_SIZE,
} from "../lib/validation";
import { validResumeBytes } from "../lib/resume";
const valid = {
  name: "Test Applicant",
  email: "TEST@example.com",
  phone: "+63 912 345 6789",
  password: "a-long-passphrase",
  preferredWorkSetting: "Project-Basis",
  referredBy: "",
  talentPoolOptIn: false,
};
test("registration normalizes email and enforces required fields", () => {
  assert.equal(signupSchema.parse(valid).email, "test@example.com");
  for (const change of [
    { name: "" },
    { email: "invalid" },
    { password: "short" },
    { preferredWorkSetting: "anything" },
    { talentPoolOptIn: "yes" },
    { phone: "not-a-phone" },
  ])
    assert.equal(
      signupSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
test("resume metadata permits exactly 5 MB and rejects unsupported files", () => {
  assert.equal(
    resumeError({
      name: "resume.pdf",
      type: "application/pdf",
      size: MAX_RESUME_SIZE,
    }),
    null,
  );
  assert.ok(
    resumeError({
      name: "resume.pdf",
      type: "application/pdf",
      size: MAX_RESUME_SIZE + 1,
    }),
  );
  assert.ok(
    resumeError({ name: "resume.exe", type: "application/pdf", size: 10 }),
  );
  assert.ok(resumeError(null));
});
test("server checks PDF signatures and DOCX structure without inflating file content", () => {
  assert.equal(
    validResumeBytes(strToU8("%PDF-1.7\nfixture"), "resume.pdf"),
    true,
  );
  assert.equal(
    validResumeBytes(strToU8("<script>fake</script>"), "resume.pdf"),
    false,
  );
  const docx = zipSync({
    "[Content_Types].xml": strToU8("<Types/>"),
    "word/document.xml": strToU8("<document/>"),
  });
  assert.equal(validResumeBytes(docx, "resume.docx"), true);
  assert.equal(
    validResumeBytes(
      zipSync({ "test.txt": strToU8("not docx") }),
      "resume.docx",
    ),
    false,
  );
  assert.equal(
    validResumeBytes(
      zipSync({
        "[Content_Types].xml": strToU8("x"),
        "word/document.xml": strToU8("x"),
        "word/vbaProject.bin": strToU8("x"),
      }),
      "resume.docx",
    ),
    false,
  );
});
test("application note length and role are validated", () => {
  assert.equal(
    applicationSchema.safeParse({ jobId: "role", coverNote: "x".repeat(3001) })
      .success,
    false,
  );
  assert.equal(applicationSchema.safeParse({ jobId: "" }).success, false);
  assert.equal(applicationSchema.parse({ jobId: "role" }).coverNote, "");
});
