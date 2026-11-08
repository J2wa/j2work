"use client";
import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";
export const authClient = createAuthClient({
  plugins: [adminClient(), inferAdditionalFields<ReturnType<typeof auth>>()],
});
