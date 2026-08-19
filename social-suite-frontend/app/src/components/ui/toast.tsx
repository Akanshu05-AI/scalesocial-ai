"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: Omit<ToastMessage, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((message: Omit<ToastMessage, "id">) => {
    setMessages((prev) => [...prev, { ...message, id: crypto.randomUUID() }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {messages.map((m) => (
          <ToastPrimitive.Root
            key={m.id}
            duration={4000}
            onOpenChange={(open) => {
              if (!open) setMessages((prev) => prev.filter((x) => x.id !== m.id));
            }}
            className={cn(
              "rounded-card border border-border bg-white dark:bg-[#161b22] p-4 shadow-card",
              m.variant === "success" && "border-emerald-500",
              m.variant === "error" && "border-rose",
              m.variant === "info" && "border-sky-500"
            )}
          >
            <ToastPrimitive.Title className="text-sm font-medium">{m.title}</ToastPrimitive.Title>
            {m.description && (
              <ToastPrimitive.Description className="mt-1 text-xs text-slate">
                {m.description}
              </ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
