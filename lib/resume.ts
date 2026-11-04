import { unzipSync } from "fflate";
import { MAX_RESUME_SIZE } from "./validation";
export function validResumeBytes(bytes: Uint8Array, filename: string): boolean {
  if (!bytes.length || bytes.length > MAX_RESUME_SIZE) return false;
  if (filename.toLowerCase().endsWith(".pdf"))
    return new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-";
  if (
    !filename.toLowerCase().endsWith(".docx") ||
    bytes[0] !== 0x50 ||
    bytes[1] !== 0x4b
  )
    return false;
  try {
    const entries = new Set<string>();
    let unsafe = false;
    unzipSync(bytes, {
      filter: (file) => {
        entries.add(file.name);
        if (file.originalSize > 20 * 1024 * 1024 || entries.size > 1000)
          unsafe = true;
        return false;
      },
    });
    return (
      !unsafe &&
      entries.has("[Content_Types].xml") &&
      entries.has("word/document.xml") &&
      !entries.has("word/vbaProject.bin")
    );
  } catch {
    return false;
  }
}
