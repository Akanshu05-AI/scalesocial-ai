"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-sm text-slate">
      <Link href="/overview" className="hover:text-ink">
        Home
      </Link>
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = seg.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight size={12} />
            <Link href={href} className="capitalize hover:text-ink">
              {label}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
