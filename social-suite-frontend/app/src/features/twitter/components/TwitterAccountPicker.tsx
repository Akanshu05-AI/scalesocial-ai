"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTwitterAccounts } from "../hooks/useTwitterAccounts";
import { useTwitterConnect } from "../hooks/useTwitterConnect";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { localStore, generateLocalId } from "@/lib/local-store";
import type { TwitterAccountResponse } from "../types";

const LOCAL_ACCOUNTS_KEY = "twitter_accounts";

export function TwitterAccountPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (accountId: string) => void;
}) {
  const { data, isLoading } = useTwitterAccounts();
  const { mutate: connect, isPending: connecting } = useTwitterConnect();
  const queryClient = useQueryClient();

  function addDemoAccount() {
    const account: TwitterAccountResponse = {
      id: generateLocalId("acct"),
      twitter_user_id: generateLocalId("uid"),
      username: "demo_account",
      display_name: "Demo Account (offline)",
      profile_image_url: null,
      scope: "tweet.read tweet.write users.read offline.access",
      is_active: true,
      connected_at: new Date().toISOString(),
    };
    localStore.insert(LOCAL_ACCOUNTS_KEY, account);
    queryClient.invalidateQueries({ queryKey: ["twitter-accounts"] });
    onSelect(account.id);
  }

  if (isLoading) return <Skeleton className="h-9 w-48" />;

  const accounts = data?.accounts ?? [];

  if (accounts.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={connecting} onClick={() => connect()}>
          {connecting ? "Redirecting…" : "Connect a Twitter account"}
        </Button>
        <span className="text-xs text-slate">or</span>
        <Button size="sm" variant="ghost" onClick={addDemoAccount}>
          Use a demo account (offline)
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {accounts.map((acc) => (
        <button
          key={acc.id}
          type="button"
          onClick={() => onSelect(acc.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            selected === acc.id
              ? "border-signal bg-signal-light text-signal-dark"
              : "border-border text-slate hover:bg-ink/5"
          )}
        >
          @{acc.username}
        </button>
      ))}
    </div>
  );
}
