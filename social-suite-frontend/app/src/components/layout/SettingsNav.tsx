"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";

const TABS = [
  { label: "Profile", href: ROUTES.settingsProfile },
  { label: "Connections", href: ROUTES.settingsConnections },
  { label: "Brand voice", href: ROUTES.settingsBrandVoice },
  { label: "Team", href: ROUTES.settingsTeam },
  { label: "Security", href: ROUTES.settingsSecurity },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "border-b-2 px-3 pb-2 text-sm font-medium",
            pathname === tab.href ? "border-signal text-ink" : "border-transparent text-slate hover:text-ink"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
