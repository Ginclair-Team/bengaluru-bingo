import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Press_Start_2P, Silkscreen } from "next/font/google";
import "./globals.css";

// Three pixel faces. The variable names are a contract with the scorecard.
const display = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const label = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

const body = Pixelify_Sans({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bengaluru Pocket, a Ginhouse console",
  description:
    "Bengaluru Pocket: a pocket console of small games about the city. Start with Bingo: stamp what you've done in Bengaluru, press CONTINUE, and share how native you are. A Ginhouse game by Ginclair.",
  applicationName: "Bengaluru Pocket",
  authors: [{ name: "Ginclair" }],
  openGraph: {
    title: "Bengaluru Pocket",
    description: "Games about the city, on a pocket console. How Bengaluru are you?",
    siteName: "Ginhouse",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2B1D17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${label.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
