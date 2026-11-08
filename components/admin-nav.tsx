"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="portal-nav" aria-label="Administration">
      {[
        ["/admin", "Overview"],
        ["/admin/applications", "Applications"],
        ["/admin/jobs", "Jobs"],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={path === href ? "active" : ""}
          aria-current={path === href ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
