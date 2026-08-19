"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SettingsNav } from "@/components/layout/SettingsNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useTwitterAccounts } from "@/features/twitter/hooks/useTwitterAccounts";
import { useTwitterConnect } from "@/features/twitter/hooks/useTwitterConnect";
import { disconnectTwitterAccount } from "@/features/twitter/api";
import { useLinkedInUserId } from "@/features/linkedin/hooks/useLinkedInUserId";
import { getLinkedInConnectUrl } from "@/features/linkedin/api";
import { getFacebookLoginUrl } from "@/features/facebook/api";
import { useFacebookSession } from "@/features/facebook/hooks/useFacebookSession";
import { getInstagramLoginUrl } from "@/features/instagram/api";
import { useQueryClient } from "@tanstack/react-query";
import { Twitter, Linkedin, Facebook, Instagram, ShieldCheck, Link2, ExternalLink, Unlink } from "lucide-react";

export default function ConnectionsSettingsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: twitterAccounts } = useTwitterAccounts();
  const { mutate: connectTwitter, isPending: connectingTwitter } = useTwitterConnect();
  const { userId: linkedInUserId, setUserId: setLinkedInUserId } = useLinkedInUserId();
  const { accessToken: fbToken } = useFacebookSession();

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected === "true") toast({ title: "Account connected successfully", variant: "success" });
    if (connected === "false") toast({ title: "Connection failed or cancelled", variant: "error" });
  }, [searchParams, toast]);

  async function handleDisconnectTwitter(id: string) {
    await disconnectTwitterAccount(id);
    queryClient.invalidateQueries({ queryKey: ["twitter-accounts"] });
    toast({ title: "Twitter account disconnected", variant: "info" });
  }

  async function connectLinkedIn() {
    const { url } = await getLinkedInConnectUrl(linkedInUserId);
    window.location.href = url;
  }

  async function connectFacebook() {
    const { url } = await getFacebookLoginUrl();
    window.location.href = url;
  }

  async function connectInstagram() {
    const { url } = await getInstagramLoginUrl();
    window.location.href = url;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage platform API connections, OAuth tokens, and account access." />
      <SettingsNav />

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        {/* Twitter / X */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Twitter size={18} className="text-sky-500" /> Twitter / X OAuth 2.0
            </CardTitle>
            <Badge variant="signal" className="gap-1">
              <ShieldCheck size={12} /> Active API
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs text-slate">
              Authorizes post publishing, media uploads, and live engagement metric queries via Twitter API v2.
            </p>
            {twitterAccounts?.accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between rounded-xl border border-border p-3 bg-paper/50 dark:bg-white/5">
                <span className="text-xs font-bold text-ink dark:text-white">@{acc.username}</span>
                <Button size="sm" variant="ghost" onClick={() => handleDisconnectTwitter(acc.id)} className="h-7 text-xs text-rose hover:bg-rose/10">
                  <Unlink size={13} className="mr-1" /> Disconnect
                </Button>
              </div>
            ))}
            <Button size="sm" disabled={connectingTwitter} onClick={() => connectTwitter()} className="w-full font-semibold">
              <Link2 size={14} className="mr-1.5" />
              {connectingTwitter ? "Redirecting…" : "Connect New Twitter Account"}
            </Button>
          </CardContent>
        </Card>

        {/* LinkedIn */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Linkedin size={18} className="text-blue-600" /> LinkedIn Share API
            </CardTitle>
            <Badge variant="signal" className="gap-1">
              <ShieldCheck size={12} /> Connected
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs text-slate">
              Publishes articles and thought leadership posts to your profile or organization page.
            </p>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate uppercase">LinkedIn User Identifier</label>
              <Input
                type="number"
                value={linkedInUserId}
                onChange={(e) => setLinkedInUserId(Number(e.target.value))}
                className="h-9 text-xs"
              />
            </div>
            <Button size="sm" onClick={connectLinkedIn} className="w-full font-semibold">
              <Link2 size={14} className="mr-1.5" /> Connect LinkedIn Account
            </Button>
          </CardContent>
        </Card>

        {/* Facebook */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Facebook size={18} className="text-blue-700" /> Facebook Graph API
            </CardTitle>
            <Badge variant="amber" className="gap-1">
              {fbToken ? "Token Stored" : "Not Connected"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs text-slate">
              {fbToken ? "Access token securely cached in your active browser session." : "Connect your Facebook Page to enable direct post publishing."}
            </p>
            <Button size="sm" onClick={connectFacebook} className="w-full font-semibold">
              <Link2 size={14} className="mr-1.5" /> Connect Facebook Page
            </Button>
          </CardContent>
        </Card>

        {/* Instagram */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Instagram size={18} className="text-pink-500" /> Instagram Business API
            </CardTitle>
            <Badge variant="amber" className="gap-1">
              Graph API
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs text-slate">
              Dispatches image & video posts to Instagram Business profiles using public HTTPS media URLs.
            </p>
            <Button size="sm" onClick={connectInstagram} className="w-full font-semibold">
              <Link2 size={14} className="mr-1.5" /> Connect Instagram Business
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
