import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-ink/5 text-ink dark:bg-white/10 dark:text-white",
      signal: "bg-signal-light text-signal-dark dark:bg-teal-500/20 dark:text-teal-300",
      amber: "bg-amber-light text-amber dark:bg-amber-950/50 dark:text-amber-200",
      rose: "bg-rose-light text-rose dark:bg-rose/20 dark:text-rose-300",
      emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
