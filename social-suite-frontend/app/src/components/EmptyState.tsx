"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

/** An empty screen is an invitation to act, not a dead end. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-16 text-center">
      <Icon className="mb-3 h-8 w-8 text-slate/50" />
      <p className="font-display text-base font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate">{description}</p>
      {action && (
        <Button className="mt-4" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
