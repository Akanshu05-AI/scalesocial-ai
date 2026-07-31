"use client";

import { Bell } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/EmptyState";

// Backed by the same feed as inbox unread counts in a full build — a
// placeholder empty state stands in for that data source here.
export function NotificationsPanel() {
  return (
    <Sheet>
      <SheetTrigger className="relative flex h-9 w-9 items-center justify-center rounded-card text-slate hover:bg-ink/5">
        <Bell size={16} />
      </SheetTrigger>
      <SheetContent>
        <h2 className="font-display text-lg font-medium">Notifications</h2>
        <div className="mt-4">
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="New replies, mentions, and publish failures will show up here."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
