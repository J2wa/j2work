import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { signupSchema, loginSchema } from "@/lib/validation";
import { fail, serviceError } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try {
    return await auth().handler(request);
  } catch (error) {
    return serviceError(error);
  }
}
export async function POST(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    if (path.endsWith("/update-user"))
      return fail("Use the profile settings page.", 403);
    if (path.endsWith("/sign-up/email") || path.endsWith("/sign-in/email")) {
      const body = await request.clone().json();
      const result = (
        path.endsWith("/sign-up/email") ? signupSchema : loginSchema
      ).safeParse(body);
      if (!result.success)
        return Response.json(
          {
            message: result.error.issues[0].message,
            errors: result.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      const normalized = new Request(request.url, {
        method: request.method,
        headers: new Headers(request.headers),
        body: JSON.stringify({ ...body, ...result.data }),
      });
      return await auth().handler(normalized);
    }
    return await auth().handler(request);
  } catch (error) {
    return serviceError(error);
  }
}
