"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants";
import { useComposeDraftStore } from "@/store/compose-draft-store";
import { useRouter } from "next/navigation";
import { FileEdit, Plus, Search, Trash2, ArrowRight, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

interface DraftItem {
  id: string;
  title: string;
  content: string;
  platforms: ("twitter" | "linkedin" | "facebook" | "instagram")[];
  updatedAt: string;
}

const INITIAL_DRAFTS: DraftItem[] = [
  {
    id: "draft-1",
    title: "Q3 AI Innovation Announcement",
    content: "We're thrilled to unveil our next-generation AI automation engine built for multi-channel social management! #AI #Innovation #ProductLaunch",
    platforms: ["twitter", "linkedin"],
    updatedAt: "Today at 09:42 AM",
  },
  {
    id: "draft-2",
    title: "Thought Leadership: The Future of SaaS Architecture",
    content: "Building decoupled architectures with FastAPI and Next.js App Router allows engineering teams to scale background queue execution effortlessly.",
    platforms: ["linkedin"],
    updatedAt: "Yesterday at 04:15 PM",
  },
];

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftItem[]>(INITIAL_DRAFTS);
  const [search, setSearch] = useState("");
  const loadFromGeneratedContent = useComposeDraftStore((s) => s.loadFromGeneratedContent);

  function handleOpenInComposer(draft: DraftItem) {
    loadFromGeneratedContent(draft.content, draft.platforms);
    router.push(ROUTES.compose);
  }

  function handleDeleteDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  const filteredDrafts = drafts.filter(
    (d) => d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Drafts Workspace"
        description="Manage, refine, and transfer saved post drafts directly into the Multi-Platform Composer."
        actions={
          <Link href={ROUTES.compose}>
            <Button className="font-semibold">
              <Plus size={16} className="mr-1.5" /> New Draft
            </Button>
          </Link>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved drafts…"
            className="pl-9 h-10 text-xs"
          />
        </div>
        <p className="text-xs font-semibold text-slate">Showing {filteredDrafts.length} saved drafts</p>
      </div>

      {/* Drafts List */}
      <div className="grid gap-4">
        {filteredDrafts.map((draft) => (
          <Card key={draft.id} className="border border-border transition-all hover:shadow-md">
            <CardContent className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">{draft.title}</h3>
                  <div className="flex items-center gap-1">
                    {draft.platforms.includes("twitter") && <Twitter size={14} className="text-sky-500" />}
                    {draft.platforms.includes("linkedin") && <Linkedin size={14} className="text-blue-600" />}
                    {draft.platforms.includes("facebook") && <Facebook size={14} className="text-blue-700" />}
                    {draft.platforms.includes("instagram") && <Instagram size={14} className="text-pink-500" />}
                  </div>
                </div>
                <p className="line-clamp-2 text-xs text-slate">{draft.content}</p>
                <p className="text-[11px] text-slate/70">Last updated: {draft.updatedAt}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" onClick={() => handleOpenInComposer(draft)} className="font-semibold">
                  Edit in Composer <ArrowRight size={14} className="ml-1" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteDraft(draft.id)}
                  className="text-slate hover:text-rose hover:bg-rose/10"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDrafts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <FileEdit size={40} className="mx-auto text-slate/40 mb-3" />
            <h3 className="font-display text-lg font-bold text-ink dark:text-white">No drafts found</h3>
            <p className="mt-1 text-xs text-slate max-w-md mx-auto">
              You haven&apos;t saved any drafts yet or no drafts match your search. Create a new draft in the composer or generate content with AI.
            </p>
            <Link href={ROUTES.compose} className="mt-4 inline-block">
              <Button size="sm" className="font-semibold">
                <Plus size={15} className="mr-1.5" /> Create First Draft
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
