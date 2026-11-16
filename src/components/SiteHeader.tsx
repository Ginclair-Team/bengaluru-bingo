import Link from "next/link";
import { SeasonSwitch } from "./SeasonSwitch";

export function SiteHeader({ home = false }: { home?: boolean }) {
  const title = (
    <span className="display block text-xl sm:text-2xl">Bengaluru Bingo</span>
  );
  return (
    <header className="flex items-center justify-between gap-3 py-3">
      <div>
        {home ? (
          <h1>{title}</h1>
        ) : (
          <Link href="/" className="no-underline">
            {title}
          </Link>
        )}
        <p className="text-xs font-semibold">A Ginhouse game</p>
      </div>
      <SeasonSwitch />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t-[3px] border-black pt-4 text-xs font-semibold">
      <p>Made at Ginhouse by Ginclair. Nothing personal is stored: your card lives in this browser.</p>
    </footer>
  );
}
