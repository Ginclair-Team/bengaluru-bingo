import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, Martian_Mono } from "next/font/google";
import { ThemeProvider } from "@/theme/context";
import { seasonBootScript, seasonCss, seasonForDate } from "@/theme/seasons";
import "./globals.css";

const display = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bengaluru Bingo, a Ginhouse game",
  description:
    "Stamp everything you've done in Bengaluru, flip the card, and share how native you are. A Ginhouse game by Ginclair.",
  applicationName: "Bengaluru Bingo",
  authors: [{ name: "Ginclair" }],
  openGraph: {
    title: "Bengaluru Bingo",
    description: "How Bengaluru are you? Stamp the card and find out.",
    siteName: "Ginhouse",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The server's guess; the boot script corrects it to the visitor's own
  // calendar (or their pinned season) before first paint.
  const season = seasonForDate(new Date());

  return (
    <html
      lang="en-IN"
      data-season={season}
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: seasonCss(season) }} />
        <script dangerouslySetInnerHTML={{ __html: seasonBootScript }} />
      </head>
      <body>
        <ThemeProvider initialSeason={season}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
