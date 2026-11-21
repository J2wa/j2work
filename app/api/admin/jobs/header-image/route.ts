import { NextRequest } from "next/server";
import { z } from "zod";
import { adminAccess } from "@/lib/admin";
import { AiListingError, generateHeaderImage } from "@/lib/ai-listing";
import { fail, sameOrigin, serviceError } from "@/lib/http";
import { storeJobHeader } from "@/lib/job-images";
import { allowAi } from "@/lib/limits";

export const maxDuration = 60;

const imageInput = z
  .object({ imageBrief: z.string().trim().min(10).max(500) })
  .strict();

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const access = await adminAccess();
    if (access.error) return access.error;

    const body = await request.json().catch(() => null);
    const parsed = imageInput.safeParse(body);
    if (!parsed.success)
      return fail("Describe the scene in 10 to 500 characters.");
    if (!(await allowAi(access.user.id, "image")))
      return fail("Image generation limit reached. Try again later.", 429);
    if (!process.env.BLOB_READ_WRITE_TOKEN?.trim())
      return fail("Header image storage is unavailable.", 503);

    const { bytes, ext } = await generateHeaderImage(parsed.data.imageBrief);
    const url = await storeJobHeader(bytes, ext);
    return Response.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof AiListingError)
      return fail(error.message, error.status);
    return serviceError(error);
  }
}
