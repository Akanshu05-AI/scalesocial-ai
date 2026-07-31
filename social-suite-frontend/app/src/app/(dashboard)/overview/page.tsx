"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTwitterAccounts } from "@/features/twitter/hooks/useTwitterAccounts";
import { fetchScheduledQueue } from "@/features/ai-writer/api";
import { ROUTES } from "@/constants";
import { formatDateTime } from "@/utils/format";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate">{label}</p>
        <p className="mt-1 font-display text-2xl font-medium text-ink">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { data: accountsData } = useTwitterAccounts();
  const { data: scheduled } = useQuery({ queryKey: ["ai-scheduled-queue"], queryFn: fetchScheduledQueue });

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Your Twitter accounts and the generic AI-writer schedule queue — the only two things this backend can actually list."
        actions={
          <Link href={ROUTES.compose}>
            <Button>New post</Button>
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Connected Twitter accounts" value={accountsData?.total ?? "—"} />
        <StatCard label="Scheduled (AI queue)" value={scheduled?.length ?? "—"} />
        <StatCard label="Facebook / LinkedIn / Instagram" value="not listable" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connected Twitter accounts</CardTitle>
            <Link href={ROUTES.settingsConnections} className="text-xs text-signal-dark">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {accountsData?.accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between rounded-card border border-border px-3 py-2">
                <span className="text-sm">@{acc.username}</span>
                <span className="text-xs text-slate">{acc.is_active ? "Active" : "Inactive"}</span>
              </div>
            ))}
            {accountsData?.accounts.length === 0 && (
              <p className="text-sm text-slate">No accounts connected yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scheduled?.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between rounded-card border border-border px-3 py-2">
                <span className="line-clamp-1 text-sm">{post.draft}</span>
                <span className="text-xs text-slate">{formatDateTime(post.scheduled_time)}</span>
              </div>
            ))}
            {scheduled?.length === 0 && <p className="text-sm text-slate">Nothing queued.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
