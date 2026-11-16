import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BingoCardIllustrator } from "@/components/BingoCardIllustrator";
import { SeasonalScorecard } from "@/components/Cards/SeasonalScorecard";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { TILES, decodeMarks, journeyFor, scoreFor } from "@/lib/game";

type Props = { params: { a: string; b: string } };

export const metadata: Metadata = {
  title: "Bingo Journey, Bengaluru Bingo",
  description: "Two Bengaluru Bingo cards, clubbed: what you've both done and what to try together.",
};

function TileList({ indexes, empty }: { indexes: number[]; empty: string }) {
  if (indexes.length === 0) return <p className="mt-3 text-xs font-semibold">{empty}</p>;
  return (
    <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3 gap-y-2">
      {indexes.map((i) => (
        <li key={TILES[i].id} className="flex items-center gap-2 text-xs font-semibold leading-tight">
          <BingoCardIllustrator id={TILES[i].id} className="block w-8 flex-none [&_svg]:block" strokeWidth={2.6} />
          {TILES[i].name}
        </li>
      ))}
    </ul>
  );
}

export default function JourneyPage({ params }: Props) {
  const a = decodeMarks(params.a);
  const b = decodeMarks(params.b);
  if (a === null || b === null) notFound();

  const scoreA = scoreFor(a);
  const scoreB = scoreFor(b);
  const journey = journeyFor(a, b);
  const match = Math.round(((journey.both.length + journey.neither.length) / TILES.length) * 100);

  return (
    <div className="mx-auto max-w-[472px] px-3 pb-10 sm:px-4 lg:max-w-[1040px] lg:px-8">
      <SiteHeader />
      <main>
        <h1 className="display mt-2 text-3xl lg:text-5xl">Bingo Journey</h1>
        <p className="mt-2 max-w-[40rem] text-sm font-semibold">
          Two cards, clubbed. Your Bengalurus match on {match}% of the board.
        </p>

        {/* Bento: two cards, then what they add up to. */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div>
            <SeasonalScorecard marks={a} title={`First card: ${scoreA.percent}% Bengaluru native, ${scoreA.badge}`} />
          </div>
          <div>
            <SeasonalScorecard marks={b} title={`Second card: ${scoreB.percent}% Bengaluru native, ${scoreB.badge}`} />
          </div>

          <section className="panel col-span-2 p-4">
            <h2 className="display text-lg">Try these together</h2>
            <p className="mt-1 text-xs">Neither of you has stamped these {journey.neither.length} yet.</p>
            <TileList indexes={journey.neither} empty="Between you, the whole board is stamped." />
          </section>

          <section className="panel col-span-2 p-4" style={{ background: "var(--board)", color: "var(--board-ink)" }}>
            <h2 className="display text-lg">You've both done {journey.both.length}</h2>
            <TileList indexes={journey.both} empty="No overlap yet. Plenty to argue about." />
          </section>

          <section className="panel col-span-2 p-4 lg:col-span-2">
            <h2 className="display text-lg">Only card {scoreA.code.toUpperCase()}</h2>
            <p className="mt-1 text-xs">The {scoreA.badge} can play guide for these.</p>
            <TileList indexes={journey.onlyA} empty="Nothing the second card hasn't also done." />
          </section>

          <section className="panel col-span-2 p-4 lg:col-span-2">
            <h2 className="display text-lg">Only card {scoreB.code.toUpperCase()}</h2>
            <p className="mt-1 text-xs">The {scoreB.badge} can play guide for these.</p>
            <TileList indexes={journey.onlyB} empty="Nothing the first card hasn't also done." />
          </section>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/" className="btn btn--primary">
            Back to my board
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
