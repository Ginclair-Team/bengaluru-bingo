"use client";

import { useMemo, useState, useEffect, type CSSProperties } from "react";
import { BingoCardIllustrator } from "@/games/bingo/illustrator";
import { stampBadgeSvg } from "@/games/bingo/illustrator/art";
import { categoryGlyphSvg } from "@/games/bingo/cards/glyphs";
import { StarIcon } from "@/components/icons";
import { CATEGORIES, GRID, TILES, TILE_COUNT, countMarks, isMarked, type Marks } from "@/games/bingo/rules";

export type Celebration = {
  id: number;
  /** Tiles to flash, in order. */
  cells: number[];
  banner: string;
  full: boolean;
};

const CONFETTI = ["--cursor", "--lcd-stamped", "--cat-outdoors", "--cat-hustle"];
const CONFETTI_X = [22, 58, 96, 130, 170, 206, 240, 40, 118, 188, 76, 262];

// The tiles-in animation plays on the first board paint of a page load only.
let introPlayed = false;

/** The 5 x 5 LCD board: header letters, the grid, and the info bar. */
export function Board({
  marks,
  cursor,
  hover,
  touched,
  lines,
  fresh,
  celebrate,
  onTap,
  onHover,
}: {
  marks: Marks;
  cursor: number;
  /** A tile under a fine pointer; the info bar previews it. */
  hover: number | null;
  /** False until the first input; the info bar shows the controls hint. */
  touched: boolean;
  lines: number;
  fresh: { index: number; n: number } | null;
  celebrate: Celebration | null;
  onTap: (index: number) => void;
  onHover: (index: number | null) => void;
}) {
  const [intro] = useState(() => !introPlayed);
  useEffect(() => {
    introPlayed = true;
  }, []);

  const badge = useMemo(() => stampBadgeSvg(), []);
  const shown = hover ?? cursor;
  const tile = TILES[shown];
  const shownMarked = isMarked(marks, shown);
  const cat = CATEGORIES[tile.category];
  const col = cursor % GRID;
  const row = Math.floor(cursor / GRID);
  const flashOrder = useMemo(() => {
    const map = new Map<number, number>();
    celebrate?.cells.forEach((c, i) => map.set(c, i));
    return map;
  }, [celebrate]);
  const step = celebrate?.full ? 40 : 60;

  return (
    <div className="lcd-screen">
      <div className="lcd-header" style={{ padding: 0, position: "relative" }}>
        <div className="board-letters t-display-s" aria-hidden="true">
          {"BINGO".split("").map((letter) => (
            <span key={letter}>{letter}</span>
          ))}
        </div>
        {celebrate && (
          <div key={celebrate.id} className="banner t-display-s" aria-hidden="true">
            {celebrate.banner}
          </div>
        )}
      </div>

      <div
        className="board-grid"
        role="grid"
        aria-label="Bingo card, 25 tiles"
        data-intro={intro}
        onPointerLeave={() => onHover(null)}
      >
        {Array.from({ length: GRID }, (_, r) => (
          <div key={r} role="row" className="board-row">
            {Array.from({ length: GRID }, (_, c) => {
              const index = r * GRID + c;
              const t = TILES[index];
              const marked = isMarked(marks, index);
              const flashIdx = flashOrder.get(index);
              return (
                <div
                  key={t.id}
                  role="gridcell"
                  className="board-cell"
                  style={{ "--row": r } as CSSProperties}
                >
                  <button
                    type="button"
                    className="tile"
                    data-cell={index}
                    data-autofocus={cursor === index}
                    data-fresh={fresh?.index === index && marked ? true : undefined}
                    data-flash={flashIdx !== undefined ? true : undefined}
                    style={
                      flashIdx !== undefined
                        ? ({ "--d": `${flashIdx * step}ms` } as CSSProperties)
                        : undefined
                    }
                    tabIndex={cursor === index ? 0 : -1}
                    aria-pressed={marked}
                    aria-label={`${t.name}. ${t.blurb}`}
                    onClick={() => onTap(index)}
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") onHover(index);
                    }}
                  >
                    <BingoCardIllustrator id={t.id} className="spr tile-art" />
                    <span className="tile-label t-label">{t.short}</span>
                    {marked && (
                      <span
                        className="tile-badge"
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: badge }}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        <div
          className="cursor"
          role="presentation"
          aria-hidden="true"
          style={{
            transform: `translate(calc(${col * 58} * var(--u)), calc(${row * 58} * var(--u)))`,
          }}
        >
          <div className="cursor-inner">
            <i className="cursor-c tl" />
            <i className="cursor-c tr" />
            <i className="cursor-c bl" />
            <i className="cursor-c br" />
          </div>
        </div>
      </div>

      <div className="infobar">
        <span className="sr-only-live" aria-live="polite" aria-atomic="true">
          {touched || hover !== null
            ? `${tile.name}, ${shownMarked ? "stamped" : "not stamped"}`
            : ""}
        </span>
        <div aria-hidden="true">
          {touched || hover !== null ? (
            <>
              <div className="infobar-line1">
                <span className="infobar-name t-body-strong">{tile.name}</span>
                <span className="infobar-count">
                  <span className="t-display-s">
                    {countMarks(marks)}/{TILE_COUNT}
                  </span>
                  {Array.from({ length: Math.min(lines, 5) }, (_, i) => (
                    <StarIcon key={i} className="ico" />
                  ))}
                  {lines > 5 && <span className="t-label">x{lines}</span>}
                </span>
              </div>
              <div className="infobar-detail">
                <span className="chip t-label" style={{ background: `var(--cat-${tile.category})` }}>
                  <span
                    className="glyph"
                    dangerouslySetInnerHTML={{ __html: categoryGlyphSvg(tile.category) }}
                  />
                  {cat.label}
                </span>
                <span className="blurb t-body-lcd">{tile.blurb}</span>
              </div>
            </>
          ) : (
            <p className="t-label" style={{ margin: 0, padding: "calc(14 * var(--u)) 0", textAlign: "center" }}>
              D-PAD MOVE &middot; A STAMP &middot; CONTINUE SCORE
            </p>
          )}
        </div>
      </div>

      {celebrate &&
        CONFETTI_X.map((x, i) => (
          <i
            key={`${celebrate.id}-${i}`}
            className="confetti"
            aria-hidden="true"
            style={{
              left: `calc(${x} * var(--u))`,
              background: `var(${CONFETTI[i % CONFETTI.length]})`,
              animationDelay: `${(i % 4) * 40}ms`,
            }}
          />
        ))}
    </div>
  );
}
