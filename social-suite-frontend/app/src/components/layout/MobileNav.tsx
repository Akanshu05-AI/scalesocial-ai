"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Send, Inbox, Sparkles, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";

const TABS = [
  { label: "Overview", href: ROUTES.overview, icon: LayoutGrid },
  { label: "Publish", href: ROUTES.compose, icon: Send },
  { label: "Inbox", href: ROUTES.inbox, icon: Inbox },
  { label: "AI", href: ROUTES.aiWriter, icon: Sparkles },
  { label: "More", href: ROUTES.settingsProfile, icon: MoreHorizontal },
];

/** Bottom tab bar for mobile — faster thumb reach than a hamburger drawer. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-white md:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
              active ? "text-signal" : "text-slate"
            )}
          >
            <Icon size={18} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
