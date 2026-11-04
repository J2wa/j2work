import { get, del } from "@vercel/blob";
import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploads, user } from "@/lib/db/schema";
import { sameOrigin, fail, serviceError } from "@/lib/http";
import { validResumeBytes } from "@/lib/resume";
import { MAX_RESUME_SIZE } from "@/lib/validation";
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const session = await getSession();
    if (!session) return fail("Please sign in.", 401);
    const parsed = z
      .object({ pathname: z.string().max(300) })
      .safeParse(await request.json());
    if (!parsed.success) return fail("Invalid upload.");
    const record = await db().query.uploads.findFirst({
      where: and(
        eq(uploads.pathname, parsed.data.pathname),
        eq(uploads.applicantId, session.user.id),
      ),
    });
    if (!record) return fail("Upload not found.", 404);
    if (record.completedAt) return Response.json({ ok: true });
    if (record.expiresAt < new Date())
      return fail("Upload expired. Please select your resume again.");
    const result = await get(record.pathname, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200)
      return fail("Upload has not finished. Please retry.");
    if (result.blob.size > MAX_RESUME_SIZE) {
      await result.stream.cancel();
      await del(record.pathname);
      return fail("Resume must be 5 MB or smaller.");
    }
    const bytes = new Uint8Array(
      await new Response(result.stream).arrayBuffer(),
    );
    if (!validResumeBytes(bytes, record.filename)) {
      await del(record.pathname);
      return fail(
        "This file is not a valid PDF or DOCX. Please choose another resume.",
      );
    }
    await db().transaction(async (tx) => {
      const current = await tx.query.uploads.findFirst({
        where: eq(uploads.id, record.id),
      });
      if (current?.completedAt) return;
      await tx
        .update(user)
        .set({
          resumeUrl: result.blob.url,
          resumeName: record.filename,
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id));
      await tx
        .update(uploads)
        .set({ completedAt: new Date() })
        .where(eq(uploads.id, record.id));
    });
    return Response.json({ ok: true });
  } catch (error) {
    return serviceError(error);
  }
}
