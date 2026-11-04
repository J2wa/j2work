import { NextRequest, NextResponse } from "next/server";
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expected = process.env.BETTER_AUTH_URL || request.nextUrl.origin;
  return origin === new URL(expected).origin;
}
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
export function serviceError(error: unknown) {
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  return fail(
    "We couldn’t complete that request. Please try again shortly.",
    503,
  );
}
