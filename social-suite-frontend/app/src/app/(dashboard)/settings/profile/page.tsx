"use client";

import { PageHeader } from "@/components/PageHeader";
import { SettingsNav } from "@/components/layout/SettingsNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/components/ui/toast";
import { updateUserSettings } from "@/features/auth/api";
import { useState } from "react";

export default function ProfileSettingsPage() {
  const fullName = useAuthStore((s) => s.fullName);
  const email = useAuthStore((s) => s.supabaseEmail);
  const settings = useAuthStore((s) => s.settings);
  const setSettings = useAuthStore((s) => s.setSettings);
  const { toast } = useToast();
  const [timezone, setTimezone] = useState(settings?.timezone ?? "");

  async function handleSave() {
    try {
      const updated = await updateUserSettings({ timezone });
      setSettings(updated);
      toast({ title: "Preferences saved", variant: "success" });
    } catch {
      toast({ title: "Couldn't save — backend unreachable?", variant: "error" });
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />
      <Card className="max-w-md">
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Name</label>
            {/* Name comes from Supabase user_metadata, not our backend —
                editing it would call supabase.auth.updateUser(), which
                isn't wired up here yet. */}
            <Input defaultValue={fullName ?? ""} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <Input defaultValue={email ?? ""} type="email" disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Timezone</label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Kolkata"
            />
          </div>
          <Button onClick={handleSave}>Save preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
