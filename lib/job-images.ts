import { put } from "@vercel/blob";

export const MAX_JOB_HEADER_BYTES = 2 * 1024 * 1024;

export function sniffImageExt(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte))
    return "png";
  const decoder = new TextDecoder();
  if (
    decoder.decode(bytes.subarray(0, 4)) === "RIFF" &&
    decoder.decode(bytes.subarray(8, 12)) === "WEBP"
  )
    return "webp";
  return null;
}

export async function storeJobHeader(
  bytes: Uint8Array,
  ext: NonNullable<ReturnType<typeof sniffImageExt>>,
) {
  const name = `${crypto.randomUUID()}.${ext}`;
  await put(`job-headers/${name}`, Buffer.from(bytes), {
    access: "private",
    addRandomSuffix: false,
    contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
  });
  return `/api/job-images/${name}`;
}
