import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { settings } from "../validation";
const time = (name: string) => integer(name, { mode: "timestamp_ms" });
export const user = sqliteTable(
  "applicants",
  {
    id: text("id").primaryKey(),
    name: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    image: text("image"),
    phone: text("phone").notNull().default(""),
    preferredWorkSetting: text("preferred_work_setting", {
      enum: settings,
    }).notNull(),
    referredBy: text("referred_by").notNull().default(""),
    resumeUrl: text("resume_url"),
    resumeName: text("resume_name"),
    talentPoolOptIn: integer("talent_pool_opt_in", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: time("created_at").notNull(),
    updatedAt: time("updated_at").notNull(),
  },
  (t) => [
    check(
      "valid_work_setting",
      sql`${t.preferredWorkSetting} in ('Full-Time','Part-Time','Project-Basis')`,
    ),
  ],
);
export const session = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: time("expires_at").notNull(),
    createdAt: time("created_at").notNull(),
    updatedAt: time("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);
export const account = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: time("access_token_expires_at"),
    refreshTokenExpiresAt: time("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: time("created_at").notNull(),
    updatedAt: time("updated_at").notNull(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);
export const verification = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: time("expires_at").notNull(),
  createdAt: time("created_at").notNull(),
  updatedAt: time("updated_at").notNull(),
});
export const rateLimit = sqliteTable("rate_limits", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("last_request").notNull(),
});
export const jobs = sqliteTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    department: text("department").notNull(),
    roleType: text("role_type").notNull(),
    workSetting: text("work_setting", { enum: settings }).notNull(),
    location: text("location").notNull(),
    remote: integer("remote", { mode: "boolean" }).notNull().default(true),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    requirements: text("requirements").notNull(),
    isActive: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: time("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("jobs_active_idx").on(t.isActive)],
);
export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    applicantId: text("applicant_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id),
    status: text("status", {
      enum: ["submitted", "reviewing", "shortlisted", "hired", "not_selected"],
    })
      .notNull()
      .default("submitted"),
    coverNote: text("cover_note").notNull().default(""),
    resumeUrl: text("resume_url").notNull(),
    submittedAt: time("submitted_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("one_application_per_job").on(t.applicantId, t.jobId),
    index("application_job_idx").on(t.jobId),
  ],
);
export const uploads = sqliteTable("resume_uploads", {
  id: text("id").primaryKey(),
  applicantId: text("applicant_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  pathname: text("pathname").notNull().unique(),
  filename: text("filename").notNull(),
  expiresAt: time("expires_at").notNull(),
  completedAt: time("completed_at"),
});
export const userRelations = relations(user, ({ many }) => ({
  applications: many(applications),
  sessions: many(session),
  accounts: many(account),
}));
export const applicationRelations = relations(applications, ({ one }) => ({
  applicant: one(user, {
    fields: [applications.applicantId],
    references: [user.id],
  }),
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
}));
export const jobRelations = relations(jobs, ({ many }) => ({
  applications: many(applications),
}));
export type Job = typeof jobs.$inferSelect;

export const applicationEmails = sqliteTable("application_emails", {
  applicationId: text("application_id")
    .primaryKey()
    .references(() => applications.id, { onDelete: "cascade" }),
  payload: text("payload").notNull(),
  sentAt: time("sent_at"),
  lastAttemptAt: time("last_attempt_at"),
  error: text("error"),
});
