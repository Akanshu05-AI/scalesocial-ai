"use client";

import { PageHeader } from "@/components/PageHeader";
import { SettingsNav } from "@/components/layout/SettingsNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SecuritySettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />
      <Card className="max-w-md">
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Current password</label>
            <Input type="password" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">New password</label>
            <Input type="password" />
          </div>
          <Button>Update password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
