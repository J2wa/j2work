import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "./db";
import * as schema from "./db/schema";
let instance: ReturnType<typeof createAuth> | undefined;
function createAuth() {
  if (!process.env.BETTER_AUTH_SECRET)
    throw new Error("Authentication is not configured");
  return betterAuth({
    appName: "ACES Careers",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db(), { provider: "sqlite", schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 30,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
      },
    },
    user: {
      additionalFields: {
        phone: { type: "string", required: false, defaultValue: "" },
        preferredWorkSetting: {
          type: ["Full-Time", "Part-Time", "Project-Basis"],
          required: true,
        },
        referredBy: { type: "string", required: false, defaultValue: "" },
        talentPoolOptIn: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        resumeUrl: { type: "string", required: false, input: false },
        resumeName: { type: "string", required: false, input: false },
      },
    },
    plugins: [
      admin({ defaultRole: "user", adminRoles: ["admin"] }),
      nextCookies(),
    ],
  });
}
export function auth() {
  return (instance ??= createAuth());
}
export const getSession = cache(async () => {
  const h = await headers();
  if (!h.get("cookie")?.includes("better-auth.session_token")) return null;
  return auth().api.getSession({ headers: h });
});
export async function requireApplicant(complete = true) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (complete && !session.user.resumeUrl) redirect("/onboarding");
  return session.user;
}
