"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SettingsNav } from "@/components/layout/SettingsNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    if (connected === "true") toast({ title: "Account connected", variant: "success" });
    if (connected === "false") toast({ title: "Connection failed", variant: "error" });
  }, [searchParams, toast]);

  async function handleDisconnectTwitter(id: string) {
    await disconnectTwitterAccount(id);
    queryClient.invalidateQueries({ queryKey: ["twitter-accounts"] });
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
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />

      <div className="max-w-md space-y-4">
        <Card>
          <CardHeader><CardTitle>Twitter / X</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {twitterAccounts?.accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between rounded-card border border-border px-3 py-2">
                <span className="text-sm">@{acc.username}</span>
                <Button size="sm" variant="outline" onClick={() => handleDisconnectTwitter(acc.id)}>
                  Disconnect
                </Button>
              </div>
            ))}
            <Button size="sm" disabled={connectingTwitter} onClick={() => connectTwitter()}>
              {connectingTwitter ? "Redirecting…" : "Connect Twitter"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>LinkedIn</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate">
              This backend identifies LinkedIn accounts by a raw integer user_id, not your logged-in
              account — set it here as a stopgap.
            </p>
            <Input
              type="number"
              value={linkedInUserId}
              onChange={(e) => setLinkedInUserId(Number(e.target.value))}
            />
            <Button size="sm" onClick={connectLinkedIn}>Connect LinkedIn</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Facebook</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate">
              {fbToken ? "A Facebook token is stored in this browser." : "Not connected in this browser."}
            </p>
            <Button size="sm" onClick={connectFacebook}>Connect Facebook</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Instagram</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate">No account-listing endpoint exists yet for Instagram.</p>
            <Button size="sm" onClick={connectInstagram}>Connect Instagram</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
