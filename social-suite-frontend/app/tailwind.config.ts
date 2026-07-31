import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12151A",       // near-black surface — sidebar, high-contrast text
        paper: "#F6F5F2",     // app background
        slate: "#4B5563",     // secondary text
        signal: {
          DEFAULT: "#0F9E92", // primary accent — "on air" teal
          light: "#E4F5F3",
          dark: "#0B7A71",
        },
        amber: { DEFAULT: "#D9A441", light: "#FBF1DF" },
        rose: { DEFAULT: "#E1495F", light: "#FBE7EA" },
        border: "#E4E2DC",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,21,26,0.04), 0 1px 1px rgba(18,21,26,0.03)",
      },
    },
  },
  plugins: [],
};

export default config;
