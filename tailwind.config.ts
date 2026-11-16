import type { Config } from "tailwindcss";

// One fixed palette. Every colour is a CSS custom property on :root
// (src/app/globals.css), so components never hard-code a hex.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        desk: "var(--desk)",
        "desk-2": "var(--desk-2)",
        "desk-shadow": "var(--desk-shadow)",
        "desk-ink": "var(--desk-ink)",
        "desk-dim": "var(--desk-dim)",
        shell: "var(--shell)",
        "shell-hi": "var(--shell-hi)",
        "shell-lo": "var(--shell-lo)",
        "shell-edge": "var(--shell-edge)",
        "shell-ink": "var(--shell-ink)",
        bezel: "var(--bezel)",
        "bezel-hi": "var(--bezel-hi)",
        "bezel-ink": "var(--bezel-ink)",
        "lcd-off": "var(--lcd-off)",
        "lcd-ink": "var(--lcd-ink)",
        "lcd-dim": "var(--lcd-dim)",
        "lcd-mid": "var(--lcd-mid)",
        "lcd-paper": "var(--lcd-paper)",
        "lcd-white": "var(--lcd-white)",
        "lcd-stamped": "var(--lcd-stamped)",
        stamp: "var(--stamp)",
        cursor: "var(--cursor)",
        "btn-ab": "var(--btn-ab)",
        "btn-pill": "var(--btn-pill)",
        "btn-dark": "var(--btn-dark)",
        focus: "var(--focus)",
        "cat-food": "var(--cat-food)",
        "cat-commute": "var(--cat-commute)",
        "cat-outdoors": "var(--cat-outdoors)",
        "cat-hustle": "var(--cat-hustle)",
        "cat-scene": "var(--cat-scene)",
        "cat-none": "var(--cat-none)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-monospace", "monospace"],
        label: ["var(--font-label)", "ui-monospace", "monospace"],
        ui: ["var(--font-label)", "ui-monospace", "monospace"],
        body: ["var(--font-body)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        none: "0px",
        shell: "32px",
        bezel: "14px",
      },
      spacing: {
        pixel: "4px",
        gutter: "8px",
        panel: "16px",
        "column-gap": "56px",
      },
    },
  },
  plugins: [],
};

export default config;
