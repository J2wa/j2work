import { NextRequest } from "next/server";
import { adminAccess } from "@/lib/admin";
import {
  AiListingError,
  listingInputSchema,
  polishListing,
} from "@/lib/ai-listing";
import { fail, sameOrigin, serviceError } from "@/lib/http";
import { allowAi } from "@/lib/limits";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return fail("Invalid origin.", 403);
    const access = await adminAccess();
    if (access.error) return access.error;

    const body = await request.json().catch(() => null);
    const parsed = listingInputSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    if (!(await allowAi(access.user.id, "polish")))
      return fail("AI drafting limit reached. Try again later.", 429);

    return Response.json({ listing: await polishListing(parsed.data) });
  } catch (error) {
    if (error instanceof AiListingError)
      return fail(error.message, error.status);
    return serviceError(error);
  }
}
