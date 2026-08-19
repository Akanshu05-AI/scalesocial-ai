"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-card border border-border bg-white dark:bg-[#161b22] px-3 text-sm text-ink dark:text-[#f0f6fc] placeholder:text-slate/60 dark:placeholder:text-slate-400 dark:border-[#30363d] focus-visible:border-signal dark:focus-visible:border-teal-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-card border border-border bg-white dark:bg-[#161b22] px-3 py-2 text-sm text-ink dark:text-[#f0f6fc] placeholder:text-slate/60 dark:placeholder:text-slate-400 dark:border-[#30363d] focus-visible:border-signal dark:focus-visible:border-teal-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
