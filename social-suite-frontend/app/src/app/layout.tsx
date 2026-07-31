import type { Metadata } from "next";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Suite",
  description: "Compose, schedule, and reply across every platform from one inbox.",
};

// Blocking inline script avoids a flash of the wrong theme on first paint —
// reads the persisted preference before React hydrates.
const themeInitScript = `
(function() {
  try {
    var stored = JSON.parse(localStorage.getItem("ui-preferences") || "{}");
    var theme = stored?.state?.theme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
