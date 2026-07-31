export const PLATFORMS = ["twitter", "linkedin", "facebook", "instagram"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; color: string; charLimit: number | null }
> = {
  twitter: { label: "Twitter / X", color: "#1D1D1F", charLimit: 280 },
  linkedin: { label: "LinkedIn", color: "#0A66C2", charLimit: 3000 },
  facebook: { label: "Facebook", color: "#1877F2", charLimit: 63206 },
  instagram: { label: "Instagram", color: "#C13584", charLimit: 2200 },
};

export const ROUTES = {
  login: "/login",
  oauthCallback: "/oauth/callback",
  overview: "/overview",
  analytics: "/overview/analytics",
  compose: "/publishing/compose",
  drafts: "/publishing/drafts",
  scheduled: "/publishing/scheduled",
  published: "/publishing/published",
  calendar: "/publishing/calendar",
  aiWriter: "/ai/writer",
  aiLinkedInArticle: "/ai/writer/linkedin-article",
  aiTwitterThread: "/ai/writer/twitter-thread",
  inbox: "/inbox",
  settingsProfile: "/settings/profile",
  settingsConnections: "/settings/connections",
  settingsBrandVoice: "/settings/brand-voice",
  settingsTeam: "/settings/team",
  settingsSecurity: "/settings/security",
} as const;

export const QUERY_KEYS = {
  posts: (filters?: unknown) => ["posts", filters] as const,
  post: (id: string) => ["posts", id] as const,
  conversations: (filters?: unknown) => ["conversations", filters] as const,
  conversation: (id: string) => ["conversations", id] as const,
  connectedAccounts: ["connected-accounts"] as const,
  analyticsOverview: (range?: string) => ["analytics", "overview", range] as const,
  currentUser: ["current-user"] as const,
} as const;
