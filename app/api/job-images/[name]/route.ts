import { get } from "@vercel/blob";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(name))
    return new Response(null, { status: 404 });
  try {
    // Only public job artwork can be served here; never accept resume paths or arbitrary URLs.
    const result = await get(`job-headers/${name}`, { access: "private" });
    if (!result || result.statusCode !== 200)
      return new Response(null, { status: 404 });
    const ext = name.split(".").pop();
    return new Response(result.stream, {
      headers: {
        "Content-Type": ext === "jpg" ? "image/jpeg" : `image/${ext}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=86400",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
