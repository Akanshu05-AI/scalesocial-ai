"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

// Everything under (dashboard) requires a live session, so there's no
// valid static HTML to serve pre-login — force SSR at request time
// instead of attempting build-time prerendering.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
