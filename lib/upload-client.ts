"use client";
import { upload } from "@vercel/blob/client";
export async function uploadResume(
  file: File,
  userId: string,
  onProgress: (value: number) => void,
) {
  const extension = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";
  const pathname = `resumes/${userId}/${crypto.randomUUID()}.${extension}`;
  await upload(pathname, file, {
    access: "private",
    handleUploadUrl: "/api/resume/upload",
    contentType:
      extension === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    clientPayload: JSON.stringify({ filename: file.name }),
    onUploadProgress: ({ percentage }) => onProgress(Math.round(percentage)),
  });
  const res = await fetch("/api/resume/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pathname }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error || "We couldn’t save your resume. Please try again.",
    );
}
