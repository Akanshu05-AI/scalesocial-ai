"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={6}
        className={cn(
          "z-50 min-w-[180px] rounded-card border border-border bg-white p-1 shadow-card",
          className
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        "cursor-pointer rounded-[6px] px-2 py-1.5 text-sm text-ink outline-none",
        "focus:bg-ink/5 data-[disabled]:opacity-40",
        className
      )}
      {...props}
    />
  );
}

export const DropdownMenuSeparator = () => <div className="my-1 h-px bg-border" />;
