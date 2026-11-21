import { NextRequest } from "next/server";
import { adminAccess } from "@/lib/admin";
import { fail, sameOrigin, serviceError } from "@/lib/http";
import { allowUpload } from "@/lib/limits";
import {
  MAX_JOB_HEADER_BYTES,
  sniffImageExt,
  storeJobHeader,
} from "@/lib/job-images";
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const access = await adminAccess();
    if (access.error) return access.error;
    if (!(await allowUpload(access.user.id)))
      return fail("Upload limit reached. Try again later.", 429);
    if (Number(request.headers.get("content-length")) > 2200000)
      return fail("Choose an image up to 2 MB.", 413);
    const file = (await request.formData()).get("image");
    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > MAX_JOB_HEADER_BYTES
    )
      return fail("Choose a JPG, PNG or WebP image up to 2 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = sniffImageExt(bytes);
    if (!ext) return fail("Choose a valid JPG, PNG or WebP image.");
    const url = await storeJobHeader(bytes, ext);
    return Response.json({ url }, { status: 201 });
  } catch (error) {
    return serviceError(error);
  }
}
