"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** States its failure plainly — never vague, never apologetic. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-rose/30 bg-rose-light py-12 text-center">
      <AlertTriangle className="mb-3 h-6 w-6 text-rose" />
      <p className="text-sm font-medium text-ink">{message}</p>
      {onRetry && (
        <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
