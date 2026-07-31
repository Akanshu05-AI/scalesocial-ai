import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Platform } from "@/constants";

interface ComposeDraft {
  content: string;
  platforms: Platform[];
  scheduledAt: string | null;
}

interface ComposeDraftState {
  draft: ComposeDraft;
  setDraft: (draft: Partial<ComposeDraft>) => void;
  /** Used by the AI Writer's "Edit & Send to Composer" handoff. */
  loadFromGeneratedContent: (content: string, platforms: Platform[]) => void;
  reset: () => void;
}

const emptyDraft: ComposeDraft = { content: "", platforms: [], scheduledAt: null };

export const useComposeDraftStore = create<ComposeDraftState>()(
  persist(
    (set) => ({
      draft: emptyDraft,
      setDraft: (partial) => set((s) => ({ draft: { ...s.draft, ...partial } })),
      loadFromGeneratedContent: (content, platforms) =>
        set({ draft: { content, platforms, scheduledAt: null } }),
      reset: () => set({ draft: emptyDraft }),
    }),
    {
      name: "compose-draft",
      // sessionStorage on purpose: survives a nav away/back within the tab,
      // clears on tab close rather than lingering like localStorage would.
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
