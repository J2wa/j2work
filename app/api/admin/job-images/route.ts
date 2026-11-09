import { put } from "@vercel/blob";
import { NextRequest } from "next/server";
import { adminAccess } from "@/lib/admin";
import { fail, sameOrigin, serviceError } from "@/lib/http";
import { allowUpload } from "@/lib/limits";
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
    if (!(file instanceof File) || !file.size || file.size > 2 * 1024 * 1024)
      return fail("Choose a JPG, PNG or WebP image up to 2 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext =
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
        ? "jpg"
        : [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)
          ? "png"
          : new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
              new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
            ? "webp"
            : null;
    if (!ext) return fail("Choose a valid JPG, PNG or WebP image.");
    const name = `${crypto.randomUUID()}.${ext}`;
    await put(`job-headers/${name}`, Buffer.from(bytes), {
      access: "private",
      addRandomSuffix: false,
      contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
    });
    return Response.json({ url: `/api/job-images/${name}` }, { status: 201 });
  } catch (error) {
    return serviceError(error);
  }
}
