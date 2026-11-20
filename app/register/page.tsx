import { redirect } from "next/navigation";
import { safeReturnPath, withReturnPath } from "@/lib/return-path";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  redirect(
    withReturnPath("/signup", safeReturnPath((await searchParams).next)),
  );
}
