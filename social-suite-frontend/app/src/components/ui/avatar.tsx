"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  fallback,
  className,
}: {
  src?: string;
  fallback: string;
  className?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn("inline-flex h-9 w-9 overflow-hidden rounded-full bg-signal-light", className)}
    >
      {src && <AvatarPrimitive.Image src={src} className="h-full w-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center text-xs font-medium text-signal-dark">
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
