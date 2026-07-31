"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex gap-1 rounded-card bg-ink/5 p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-card px-3 py-1.5 text-sm font-medium text-slate transition-colors",
        "data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card",
        className
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
