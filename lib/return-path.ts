export function safeReturnPath(value: string | string[] | undefined) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return undefined;
  }

  const origin = "https://careers.acesintelligence.xyz";
  try {
    const pathname = decodeURIComponent(value.split(/[?#]/, 1)[0]);
    // Browsers can normalize backslashes, control characters and dot segments.
    const hasControlCharacter = [...pathname].some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127;
    });
    if (
      pathname.includes("\\") ||
      pathname.startsWith("//") ||
      hasControlCharacter
    ) {
      return undefined;
    }
    const target = new URL(value, origin);
    if (target.origin === origin && !target.pathname.startsWith("//")) {
      return value;
    }
  } catch {
    return undefined;
  }
}

export function withReturnPath(path: string, next?: string) {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}
