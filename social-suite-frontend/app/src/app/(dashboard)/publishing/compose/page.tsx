"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TwitterComposer } from "@/features/twitter/components/TwitterComposer";
import { LinkedInComposer } from "@/features/linkedin/components/LinkedInComposer";
import { FacebookComposer } from "@/features/facebook/components/FacebookComposer";
import { InstagramComposer } from "@/features/instagram/components/InstagramComposer";
import { UnifiedBatchComposer } from "@/features/publishing/components/UnifiedBatchComposer";
import { Twitter, Linkedin, Facebook, Instagram, Layers, PenTool } from "lucide-react";

export default function ComposePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Platform Composer"
        description="Craft, preview, and dispatch tailored posts directly or cross-post to multiple channels at once."
      />
      <Card className="max-w-3xl border border-border shadow-md">
        <CardContent className="p-6">
          <Tabs defaultValue="batch">
            <TabsList className="grid w-full grid-cols-2 gap-1 rounded-xl bg-paper/80 p-1 dark:bg-white/5 sm:grid-cols-5">
              <TabsTrigger
                value="batch"
                className="flex items-center justify-center gap-1.5 font-semibold text-slate hover:text-ink dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300 dark:data-[state=active]:border dark:data-[state=active]:border-emerald-500/30"
              >
                <Layers size={15} className="text-emerald-500" /> Batch
              </TabsTrigger>
              <TabsTrigger
                value="twitter"
                className="flex items-center justify-center gap-1.5 font-medium text-slate hover:text-ink dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-sky-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-sky-500/20 dark:data-[state=active]:text-sky-300 dark:data-[state=active]:border dark:data-[state=active]:border-sky-500/30"
              >
                <Twitter size={15} className="text-sky-500" /> Twitter / X
              </TabsTrigger>
              <TabsTrigger
                value="linkedin"
                className="flex items-center justify-center gap-1.5 font-medium text-slate hover:text-ink dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-500/20 dark:data-[state=active]:text-blue-300 dark:data-[state=active]:border dark:data-[state=active]:border-blue-500/30"
              >
                <Linkedin size={15} className="text-blue-600 dark:text-blue-400" /> LinkedIn
              </TabsTrigger>
              <TabsTrigger
                value="facebook"
                className="flex items-center justify-center gap-1.5 font-medium text-slate hover:text-ink dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-600/20 dark:data-[state=active]:text-blue-300 dark:data-[state=active]:border dark:data-[state=active]:border-blue-500/30"
              >
                <Facebook size={15} className="text-blue-700 dark:text-blue-400" /> Facebook
              </TabsTrigger>
              <TabsTrigger
                value="instagram"
                className="flex items-center justify-center gap-1.5 font-medium text-slate hover:text-ink dark:text-slate-300 data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-pink-500/20 dark:data-[state=active]:text-pink-300 dark:data-[state=active]:border dark:data-[state=active]:border-pink-500/30"
              >
                <Instagram size={15} className="text-pink-500" /> Instagram
              </TabsTrigger>
            </TabsList>

            <TabsContent value="batch" className="mt-6">
              <UnifiedBatchComposer />
            </TabsContent>
            <TabsContent value="twitter" className="mt-6">
              <TwitterComposer />
            </TabsContent>
            <TabsContent value="linkedin" className="mt-6">
              <LinkedInComposer />
            </TabsContent>
            <TabsContent value="facebook" className="mt-6">
              <FacebookComposer />
            </TabsContent>
            <TabsContent value="instagram" className="mt-6">
              <InstagramComposer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
