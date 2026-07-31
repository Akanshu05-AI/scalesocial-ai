"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Send,
  Inbox,
  Sparkles,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { useUiStore } from "@/store/ui-store";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Overview", href: ROUTES.overview, icon: LayoutGrid }],
  },
  {
    label: "Publishing",
    items: [
      { label: "Compose", href: ROUTES.compose, icon: Send },
      { label: "Drafts", href: ROUTES.drafts, icon: Send },
      { label: "Scheduled", href: ROUTES.scheduled, icon: Send },
      { label: "Published", href: ROUTES.published, icon: Send },
      { label: "Calendar", href: ROUTES.calendar, icon: Send },
    ],
  },
  {
    label: "Engage",
    items: [
      { label: "Inbox", href: ROUTES.inbox, icon: Inbox },
      { label: "AI Writer", href: ROUTES.aiWriter, icon: Sparkles },
    ],
  },
  {
    label: "Workspace",
    items: [{ label: "Settings", href: ROUTES.settingsProfile, icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-white/10 bg-ink text-white/80 transition-all md:flex",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {!sidebarCollapsed && <span className="font-display text-sm font-semibold text-white">Social Suite</span>}
        <button onClick={toggleSidebar} className="text-white/50 hover:text-white">
          {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="mb-1 px-2 text-[11px] uppercase tracking-wide text-white/30">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-card px-2.5 py-2 text-sm transition-colors",
                      active ? "bg-signal/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon size={16} />
                    {!sidebarCollapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
