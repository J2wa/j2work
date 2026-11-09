"use client";
import { useState } from "react";
export function JobHeaderImage({ url }: { url: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!url || failedUrl === url) return null;
  // Hosted images render directly; no server-side fetching or image proxy is needed.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="job-header-image"
      onError={() => setFailedUrl(url)}
    />
  );
}
