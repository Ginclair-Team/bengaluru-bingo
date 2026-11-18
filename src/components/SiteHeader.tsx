import Link from "next/link";
import { BingoCardIllustrator } from "@/games/bingo/illustrator";

/** Compact header for the pages off the console: elephant plus wordmark, linking home. */
export function SiteHeader() {
  return (
    <header className="py-3">
      <Link
        href="/"
        className="t-ui-l inline-flex min-h-[44px] items-center gap-3 text-desk-ink no-underline"
      >
        <BingoCardIllustrator id="elephant" className="spr" />
        <span>Bengaluru Pocket</span>
      </Link>
    </header>
  );
}

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`t-body text-desk-dim ${className}`}>
      <p>Made at Ginhouse by Ginclair. Nothing personal is stored: your card lives in this browser.</p>
    </footer>
  );
}
