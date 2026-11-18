"use client";

import { useEffect, useRef, useState } from "react";
import { spriteSvg } from "@/lib/pixel";
import { play } from "@/lib/sound";
import { useConsoleKeys } from "./context";
import { LcdHeader } from "./device/Screen";
import { CARTRIDGES } from "./registry";
import type { Cartridge } from "./types";

type Row =
  | { kind: "game"; id: string; cartridge: Cartridge }
  | { kind: "soon"; id: string }
  | { kind: "sound"; id: string };

const ROWS: Row[] = [
  ...CARTRIDGES.map((cartridge): Row => ({ kind: "game", id: `game-${cartridge.id}`, cartridge })),
  { kind: "soon", id: "soon" },
  { kind: "sound", id: "sound" },
];

const wrap = (n: number, size: number) => (n + size) % size;

/** The home menu: the cartridges on the shelf, then the sound setting. */
export function Menu({
  lastPlayed,
  muted,
  onPlay,
  onSound,
  announce,
}: {
  lastPlayed: string | null;
  muted: boolean;
  onPlay: (id: string) => void;
  onSound: () => void;
  announce: (message: string) => void;
}) {
  const start = Math.max(
    0,
    ROWS.findIndex((row) => row.kind === "game" && row.cartridge.id === lastPlayed)
  );
  const [sel, setSel] = useState(start);
  const listRef = useRef<HTMLUListElement>(null);
  const moved = useRef(false);

  const rowButtons = () => listRef.current?.querySelectorAll<HTMLElement>("[data-row] button");

  const activate = (i: number) => {
    const row = ROWS[i];
    if (row.kind === "game") {
      if (row.cartridge.status === "ready") onPlay(row.cartridge.id);
      else play("error");
    } else if (row.kind === "soon") {
      play("error");
      announce("More cartridges are coming soon.");
    } else {
      onSound();
    }
  };

  useConsoleKeys((key) => {
    if (key === "up" || key === "down") {
      moved.current = true;
      setSel((s) => wrap(s + (key === "down" ? 1 : -1), ROWS.length));
      play("move");
    } else if (key === "a" || key === "start") {
      activate(sel);
    } else if (key === "b" || key === "select") {
      play("error");
    }
  });

  // Keyboard moves follow the selection into the list.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    rowButtons()?.[sel]?.focus({ preventScroll: true });
    // rowButtons reads the list ref; the selection is the only trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  // On arrival, take focus unless something else already holds it.
  useEffect(() => {
    const active = document.activeElement;
    const inLcd = !!active && !!listRef.current?.closest(".lcd")?.contains(active);
    if (!active || active === document.body || inLcd) {
      rowButtons()?.[start]?.focus({ preventScroll: true });
    }
    // Runs once, when the menu appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="lcd-screen">
      <LcdHeader title="CARTRIDGES" />
      <ul className="menu cart-menu" ref={listRef} aria-label="Games and settings">
        {ROWS.map((row, i) => {
          const label =
            row.kind === "game"
              ? row.cartridge.title
              : row.kind === "soon"
                ? "New cartridge"
                : `Sound: ${muted ? "off" : "on"}`;
          const tagline =
            row.kind === "game" ? row.cartridge.tagline : row.kind === "soon" ? "Coming soon" : null;
          return (
            <li key={row.id} data-row>
              <button
                type="button"
                className="menu-row cart-row"
                data-selected={sel === i}
                data-autofocus={sel === i}
                aria-disabled={row.kind === "soon" || undefined}
                onFocus={() => setSel(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setSel(i);
                }}
                onClick={() => activate(i)}
              >
                <span className="caret" aria-hidden="true">
                  {">"}
                </span>
                {row.kind === "game" && (
                  <span
                    className="cart-icon"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: spriteSvg(row.cartridge.icon) }}
                  />
                )}
                <span className="cart-text">
                  <span>{label}</span>
                  {tagline && <small>{tagline}</small>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="cart-note t-body-lcd">D-pad to choose. A or START to play.</p>
    </div>
  );
}
