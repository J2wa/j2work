"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Files,
  UserRound,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
export function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <div className="portal-nav-wrap">
      <nav className="portal-nav" aria-label="Applicant navigation">
        {[
          { href: "/careers", label: "Opportunities", icon: BriefcaseBusiness },
          {
            href: "/careers/applications",
            label: "My applications",
            icon: Files,
          },
          { href: "/careers/profile", label: "My profile", icon: UserRound },
        ].map(({ href, label, icon: Icon }) => {
          const active =
            href === "/careers"
              ? pathname === "/careers" || pathname.includes("/jobs/")
              : pathname === href;
          return (
            <Link
              href={href}
              key={href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        className="signout"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const result = await authClient.signOut();
            if (result.error) throw new Error();
            router.push("/login");
            router.refresh();
          } catch {
            toast.error("Could not sign out. Please retry.");
            setBusy(false);
          }
        }}
      >
        {busy ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <LogOut size={16} />
        )}
        <span>Sign out</span>
      </button>
    </div>
  );
}
