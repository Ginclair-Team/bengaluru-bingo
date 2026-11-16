import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { BingoCardIllustrator } from "@/components/BingoCardIllustrator";
import { CardScorecard } from "@/components/Cards/CardScorecard";
import { ScreenFrame } from "@/components/device/ScreenFrame";
import { ArrowIcon } from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { TILES, decodeMarks, journeyFor, scoreFor } from "@/lib/game";

type Props = { params: { a: string; b: string } };

export const metadata: Metadata = {
  title: "Bingo Journey, Bengaluru Bingo",
  description: "Two Bengaluru Bingo cards, clubbed: what you've both done and what to try together.",
};

function TileList({ indexes, empty }: { indexes: number[]; empty: string }) {
  if (indexes.length === 0) return <p className="t-body">{empty}</p>;
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-x-3 gap-y-2">
      {indexes.map((i) => (
        <li key={TILES[i].id} className="flex items-center gap-3">
          <span className="tile-chip">
            <BingoCardIllustrator id={TILES[i].id} className="spr" />
          </span>
          <span className="t-body leading-tight">{TILES[i].name}</span>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  title,
  strip,
  inverted = false,
  note,
  children,
}: {
  title: string;
  strip: string;
  inverted?: boolean;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`panel ${inverted ? "panel--inverted" : ""}`}>
      <div className="panel__head" style={{ "--strip": strip } as CSSProperties}>
        <h2 className="t-ui-l">{title}</h2>
      </div>
      {note && <p className="t-body mb-3">{note}</p>}
      {children}
    </section>
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
    <div className="mx-auto max-w-[472px] px-4 pb-10 lg:max-w-[1040px] lg:px-8">
      <SiteHeader />
      <main>
        <h1 className="wordmark t-display-xl mt-2" style={{ textShadow: "3px 3px 0 var(--cursor)" }}>
          Bingo Journey
        </h1>
        <p className="t-body mt-4 max-w-[40rem]">
          Two cards, clubbed. Your Bengalurus match on {match}% of the board.
        </p>

        {/* Link-cable hero */}
        <div className="mx-auto mt-6 max-w-[520px]">
          <div className="grid grid-cols-2 gap-4">
            <ScreenFrame label="First card" className="screen-frame--on-desk">
              <CardScorecard
                marks={a}
                className="scorecard"
                title={`First card: ${scoreA.percent}% Bengaluru native, ${scoreA.badge}`}
              />
            </ScreenFrame>
            <ScreenFrame label="Second card" className="screen-frame--on-desk">
              <CardScorecard
                marks={b}
                className="scorecard"
                title={`Second card: ${scoreB.percent}% Bengaluru native, ${scoreB.badge}`}
              />
            </ScreenFrame>
          </div>
          <div className="cable" aria-hidden="true">
            <i className="cable__v" style={{ left: "25%" }} />
            <i className="cable__v" style={{ left: "75%" }} />
            <i className="cable__h" />
            <span className="cable__plug">{match}%</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <Panel
            title="Try these together"
            strip="var(--lcd-stamped)"
            note={`Neither of you has stamped these ${journey.neither.length} yet.`}
          >
            <TileList indexes={journey.neither} empty="Between you, the whole board is stamped." />
          </Panel>

          <Panel title={`You've both done ${journey.both.length}`} strip="var(--cat-scene)" inverted>
            <TileList indexes={journey.both} empty="No overlap yet. Plenty to argue about." />
          </Panel>

          <Panel
            title={`Only card ${scoreA.code.toUpperCase()}`}
            strip="var(--shell)"
            note={`The ${scoreA.badge} can play guide for these.`}
          >
            <TileList indexes={journey.onlyA} empty="Nothing the second card hasn't also done." />
          </Panel>

          <Panel
            title={`Only card ${scoreB.code.toUpperCase()}`}
            strip="var(--cat-hustle)"
            note={`The ${scoreB.badge} can play guide for these.`}
          >
            <TileList indexes={journey.onlyB} empty="Nothing the first card hasn't also done." />
          </Panel>
        </div>

        <div className="mt-8 flex flex-wrap">
          <Link href="/" className="btn btn--primary">
            <ArrowIcon dir="left" className="ico" />
            Back to my board
          </Link>
        </div>
      </main>
      <SiteFooter className="mt-10" />
    </div>
  );
}
