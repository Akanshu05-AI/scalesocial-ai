"use client";

import { PageHeader } from "@/components/PageHeader";
import { SettingsNav } from "@/components/layout/SettingsNav";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";

export default function TeamSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />
      <EmptyState
        icon={Users}
        title="No teammates yet"
        description="Invite people to collaborate on posts and inbox replies."
        action={{ label: "Invite a teammate", onClick: () => {} }}
      />
    </div>
  );
}
