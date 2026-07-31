"use client";

import { PageHeader } from "@/components/PageHeader";
import { SettingsNav } from "@/components/layout/SettingsNav";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Brand-voice text feeds the AI Writer's system prompt on the backend —
// the frontend just captures and persists it.
export default function BrandVoiceSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />
      <Card className="max-w-md">
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Brand voice guidelines</label>
            <Textarea
              rows={6}
              placeholder="e.g. Confident but never boastful, plain language, no corporate jargon…"
            />
          </div>
          <Button>Save guidelines</Button>
        </CardContent>
      </Card>
    </div>
  );
}
