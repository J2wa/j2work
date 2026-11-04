import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { sameOrigin, fail } from "@/lib/http";
import { MAX_RESUME_SIZE, resumeTypes } from "@/lib/validation";
import { allowUpload } from "@/lib/limits";
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, payload) => {
        if (!sameOrigin(request)) throw new Error("Invalid origin.");
        const session = await getSession();
        if (!session) throw new Error("Please sign in before uploading.");
        const prefix = `resumes/${session.user.id}/`;
        if (
          !pathname.startsWith(prefix) ||
          !/^[-a-f0-9]{36}\.(pdf|docx)$/.test(pathname.slice(prefix.length))
        )
          throw new Error("Invalid upload path.");
        const filename = String(JSON.parse(payload || "{}").filename || "")
          .replace(/[\x00-\x1f\x7f/\\]/g, "")
          .slice(0, 180);
        if (!/\.(pdf|docx)$/i.test(filename))
          throw new Error("Choose a PDF or DOCX file.");
        if (!(await allowUpload(session.user.id)))
          throw new Error("Upload limit reached. Please try again in an hour.");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await db()
          .insert(uploads)
          .values({
            id: crypto.randomUUID(),
            applicantId: session.user.id,
            pathname,
            filename,
            expiresAt,
          });
        return {
          allowedContentTypes: resumeTypes,
          maximumSizeInBytes: MAX_RESUME_SIZE,
          validUntil: expiresAt.getTime(),
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
    });
    return Response.json(response);
  } catch (error) {
    console.error("Resume upload authorization failed");
    return fail(
      error instanceof Error &&
        [
          "Please sign in before uploading.",
          "Choose a PDF or DOCX file.",
          "Upload limit reached. Please try again in an hour.",
        ].includes(error.message)
        ? error.message
        : "Could not start upload. Please sign in and try again.",
      400,
    );
  }
}
