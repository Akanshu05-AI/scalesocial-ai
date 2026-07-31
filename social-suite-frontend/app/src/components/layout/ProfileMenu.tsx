"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { logout } from "@/features/auth/api";
import { ROUTES } from "@/constants";

export function ProfileMenu() {
  const router = useRouter();
  const fullName = useAuthStore((s) => s.fullName);
  const avatarUrl = useAuthStore((s) => s.avatarUrl);
  const email = useAuthStore((s) => s.supabaseEmail);

  async function handleLogout() {
    await logout(); // supabase.auth.signOut() — AuthListener clears the store/cookie
    router.push(ROUTES.login);
  }

  const displayName = fullName ?? email ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar src={avatarUrl ?? undefined} fallback={displayName.slice(0, 1).toUpperCase()} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-ink">{displayName}</p>
          <p className="text-xs text-slate">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(ROUTES.settingsProfile)}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-rose">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
