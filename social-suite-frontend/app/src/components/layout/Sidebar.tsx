"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  PenTool,
  FileEdit,
  CalendarClock,
  CheckCircle2,
  Calendar,
  Inbox,
  Sparkles,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Share2,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { useUiStore } from "@/store/ui-store";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: ROUTES.overview, icon: LayoutGrid },
      { label: "Analytics", href: ROUTES.analytics, icon: BarChart3 },
    ],
  },
  {
    label: "Publishing",
    items: [
      { label: "Composer", href: ROUTES.compose, icon: PenTool },
      { label: "Drafts", href: ROUTES.drafts, icon: FileEdit },
      { label: "Scheduled", href: ROUTES.scheduled, icon: CalendarClock },
      { label: "Published", href: ROUTES.published, icon: CheckCircle2 },
      { label: "Calendar", href: ROUTES.calendar, icon: Calendar },
    ],
  },
  {
    label: "Engage & Create",
    items: [
      { label: "Unified Inbox", href: ROUTES.inbox, icon: Inbox },
      { label: "AI Writer Engine", href: ROUTES.aiWriter, icon: Sparkles },
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
        "hidden shrink-0 flex-col border-r border-white/10 bg-[#0b0e14] text-white/80 transition-all md:flex",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-white/5 px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 text-ink shadow-sm font-bold">
              <Share2 size={16} className="text-slate-950" />
            </div>
            <span className="font-display text-sm font-bold tracking-tight text-white">Social Suite</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150",
                      active
                        ? "bg-gradient-to-r from-teal-500/25 to-emerald-500/15 text-emerald-300 font-semibold shadow-inner border-l-2 border-emerald-400"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon
                      size={17}
                      className={cn(
                        "transition-transform duration-150 group-hover:scale-110",
                        active ? "text-emerald-400" : "text-white/50 group-hover:text-white"
                      )}
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
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
