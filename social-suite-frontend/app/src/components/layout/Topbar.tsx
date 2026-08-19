"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import { SearchBar } from "@/components/SearchBar";
import { ThemeSwitch } from "./ThemeSwitch";
import { NotificationsPanel } from "./NotificationsPanel";
import { ProfileMenu } from "./ProfileMenu";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-white/85 backdrop-blur-md dark:bg-[#0d1117]/85 px-4 transition-colors">
      <Breadcrumbs />
      <div className="flex items-center gap-2">
        <div className="hidden w-56 sm:block">
          <SearchBar value="" onChange={() => {}} placeholder="Search posts, conversations…" />
        </div>
        <ThemeSwitch />
        <NotificationsPanel />
        <ProfileMenu />
      </div>
    </header>
  );
}
