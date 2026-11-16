import type { Config } from "tailwindcss";

// Seasonal colours are CSS variables written by src/theme/seasons.ts, so one
// set of classes (bg-board, text-ink, ...) follows whichever season is active.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        board: "var(--board)",
        "board-ink": "var(--board-ink)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        stamp: "var(--stamp)",
        accent: "var(--accent)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};

export default config;
