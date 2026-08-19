"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTwitterAccounts } from "@/features/twitter/hooks/useTwitterAccounts";
import { fetchScheduledQueue } from "@/features/ai-writer/api";
import { ROUTES } from "@/constants";
import { formatDateTime } from "@/utils/format";
import { Twitter, Calendar, Sparkles, Send, Activity, Plus, ArrowUpRight, ShieldCheck } from "lucide-react";

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  gradientClass,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badgeText?: string;
  gradientClass: string;
}) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 border border-border">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">{title}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink/5 dark:bg-white/10 text-ink dark:text-white">
            <Icon size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <p className="font-display text-3xl font-bold text-ink dark:text-white">{value}</p>
          {badgeText && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={12} /> {badgeText}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { data: accountsData } = useTwitterAccounts();
  const { data: scheduled } = useQuery({ queryKey: ["ai-scheduled-queue"], queryFn: fetchScheduledQueue });

  return (
    <div className="space-y-6">
      {/* Modern Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-teal-100 text-xs font-semibold tracking-wide uppercase">
              <Sparkles size={14} /> AI-Powered Social Suite
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Multi-Channel Command Center</h1>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-teal-50">
              Compose, schedule, and orchestrate automated posts across Twitter, LinkedIn, Facebook, and Instagram.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={ROUTES.compose}>
              <Button className="bg-white text-teal-800 hover:bg-teal-50 font-semibold shadow-md">
                <Plus size={16} className="mr-1.5" /> New Post
              </Button>
            </Link>
            <Link href={ROUTES.aiWriter}>
              <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Sparkles size={16} className="mr-1.5" /> AI Writer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Connected Twitter"
          value={accountsData?.total ?? 0}
          subtitle="Active Twitter/X Handles"
          icon={Twitter}
          badgeText="Live API"
          gradientClass="from-sky-400 to-blue-600"
        />
        <MetricCard
          title="Scheduled Queue"
          value={scheduled?.length ?? 0}
          subtitle="Pending Celery Dispatch Tasks"
          icon={Calendar}
          badgeText="Active Queue"
          gradientClass="from-emerald-400 to-teal-600"
        />
        <MetricCard
          title="Multi-Channel Bridge"
          value="4 Channels"
          subtitle="Twitter • LinkedIn • Meta • IG"
          icon={Activity}
          badgeText="Configured"
          gradientClass="from-purple-400 to-indigo-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connected Channels Card */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Twitter size={18} className="text-sky-500" /> Connected Social Channels
            </CardTitle>
            <Link href={ROUTES.settingsConnections} className="text-xs font-semibold text-signal hover:underline">
              Manage All
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {accountsData?.accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-paper/50 dark:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
                    <Twitter size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">@{acc.username}</p>
                    <p className="text-xs text-slate">Twitter / X Professional Account</p>
                  </div>
                </div>
                <Badge variant="signal" className="gap-1">
                  <ShieldCheck size={12} /> Active
                </Badge>
              </div>
            ))}

            {(!accountsData || accountsData.accounts.length === 0) && (
              <div className="text-center py-6">
                <Twitter size={32} className="mx-auto text-slate/40 mb-2" />
                <p className="text-sm font-medium text-slate">No Twitter accounts connected</p>
                <Link href={ROUTES.settingsConnections} className="mt-2 inline-block text-xs text-signal font-semibold">
                  Connect Channel →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Posts Queue */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar size={18} className="text-emerald-500" /> Scheduled Post Pipeline
            </CardTitle>
            <Link href={ROUTES.scheduled} className="text-xs font-semibold text-signal hover:underline">
              View All Queue
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {scheduled?.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-paper/50 dark:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <Send size={16} />
                  </div>
                  <div className="truncate">
                    <p className="line-clamp-1 text-sm font-medium text-ink dark:text-white">{post.draft}</p>
                    <p className="text-xs text-slate">{formatDateTime(post.scheduled_time)}</p>
                  </div>
                </div>
                <Badge variant="amber" className="shrink-0 uppercase text-[10px]">
                  {post.platform}
                </Badge>
              </div>
            ))}

            {(!scheduled || scheduled.length === 0) && (
              <div className="text-center py-6">
                <Calendar size={32} className="mx-auto text-slate/40 mb-2" />
                <p className="text-sm font-medium text-slate">No posts queued in scheduler</p>
                <Link href={ROUTES.compose} className="mt-2 inline-block text-xs text-signal font-semibold">
                  Schedule New Post →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
