"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TwitterComposer } from "@/features/twitter/components/TwitterComposer";
import { LinkedInComposer } from "@/features/linkedin/components/LinkedInComposer";
import { FacebookComposer } from "@/features/facebook/components/FacebookComposer";
import { InstagramComposer } from "@/features/instagram/components/InstagramComposer";

export default function ComposePage() {
  return (
    <div>
      <PageHeader title="Compose" description="Each platform has its own posting contract — no unified endpoint exists on the backend." />
      <Card className="max-w-2xl">
        <CardContent>
          <Tabs defaultValue="twitter">
            <TabsList>
              <TabsTrigger value="twitter">Twitter / X</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
            </TabsList>

            <TabsContent value="twitter" className="mt-4">
              <TwitterComposer />
            </TabsContent>
            <TabsContent value="linkedin" className="mt-4">
              <LinkedInComposer />
            </TabsContent>
            <TabsContent value="facebook" className="mt-4">
              <FacebookComposer />
            </TabsContent>
            <TabsContent value="instagram" className="mt-4">
              <InstagramComposer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
