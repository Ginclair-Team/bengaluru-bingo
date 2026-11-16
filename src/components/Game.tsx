"use client";

import { MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BingoCardIllustrator } from "@/components/BingoCardIllustrator";
import { Board } from "@/components/Board";
import { Scorecard } from "@/components/Cards/Scorecard";
import { SharePanel } from "@/components/SharePanel";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { FlipIcon } from "@/components/icons";
import {
  CATEGORIES,
  TILES,
  TILE_COUNT,
  decodeMarks,
  isMarked,
  scoreFor,
  toggleMark,
  type Marks,
} from "@/lib/game";
import { loadGame, saveGame } from "@/lib/storage";
import { useTheme } from "@/theme/context";

export const FRIEND_KEY = "bb:friend";

// Hidden faces must not take focus or be read out.
const inertProps = (on: boolean) => (on ? ({ inert: "" } as Record<string, string>) : {});

export function Game() {
  const { season } = useTheme();
  const [marks, setMarks] = useState<Marks>(0);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [friendCode, setFriendCode] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load the saved card, and pick up a friend's card or a restore link.
  useEffect(() => {
    const game = loadGame();
    const params = new URLSearchParams(window.location.search);
    const restored = decodeMarks(params.get("c") ?? "");
    const club = params.get("club");
    let friend: string | null = null;
    try {
      if (club && decodeMarks(club) !== null) localStorage.setItem(FRIEND_KEY, club);
      const saved = localStorage.getItem(FRIEND_KEY);
      if (saved && decodeMarks(saved) !== null) friend = saved;
    } catch {
      if (club && decodeMarks(club) !== null) friend = club;
    }
    setAnonymousId(game.anonymousId);
    setMarks(restored ?? game.marks);
    setFriendCode(friend);
    if (params.get("view") === "card") setFlipped(true);
  }, []);

  useEffect(() => {
    if (anonymousId) saveGame(anonymousId, marks);
  }, [anonymousId, marks]);

  const score = useMemo(() => scoreFor(marks), [marks]);

  const toggle = useCallback((index: number) => {
    setMarks((m) => toggleMark(m, index));
    setFocused(index);
    setConfirmClear(false);
  }, []);

  const flip = useCallback(() => {
    setFlipped((was) => {
      const next = !was;
      if (next && anonymousId) {
        // Best effort. Until a database is connected this is a no-op.
        fetch("/api/scores", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ anonymous_id: anonymousId, card_code: score.code, season }),
        }).catch(() => {});
      }
      return next;
    });
    setConfirmClear(false);
  }, [anonymousId, score.code, season]);

  const tile = focused === null ? null : TILES[focused];
  const tileMarked = focused !== null && isMarked(marks, focused);
  const lines =
    score.lines === 0 ? "" : `, ${score.lines} bingo${score.lines === 1 ? "" : "s"}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-[472px] px-3 pb-10 sm:px-4 lg:max-w-[1040px] lg:px-8">
        <SiteHeader home />

        <main className="lg:grid lg:grid-cols-[440px_minmax(0,1fr)] lg:items-start lg:gap-14">
          <div className="card-stage">
            <motion.div
              className="card-flip"
              initial={false}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 64, damping: 14, mass: 1.5 }}
            >
              <div className="card-face" aria-hidden={flipped} {...inertProps(flipped)}>
                <Board marks={marks} focused={focused} onToggle={toggle} />
              </div>
              <div className="card-face card-face--back" aria-hidden={!flipped}>
                <div ref={cardRef}>
                  <Scorecard score={score} season={season} className="scorecard" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-4 lg:mt-0 lg:max-w-[30rem]">
            <p className="hidden text-base font-semibold lg:block">
              Stamp everything you've actually done in Bengaluru. Flip the card to see how native
              you are, then post it.
            </p>

            {flipped ? (
              <div className="lg:mt-6">
                <SharePanel score={score} cardRef={cardRef} friendCode={friendCode} />
              </div>
            ) : (
              <section aria-live="polite" className="panel flex min-h-[104px] items-center gap-3 p-3 lg:mt-6">
                {tile ? (
                  <>
                    <BingoCardIllustrator
                      id={tile.id}
                      strokeWidth={2}
                      className="block w-[72px] flex-none rounded-xl border-[3px] border-black p-1.5 [&_svg]:block"
                    />
                    <div className="min-w-0">
                      <h2 className="display text-base">{tile.name}</h2>
                      <p className="mt-0.5 text-xs font-bold text-ink">
                        {CATEGORIES[tile.category].label}, {tileMarked ? "stamped" : "not stamped"}
                      </p>
                      <p className="mt-1 text-xs">{tile.blurb}</p>
                    </div>
                  </>
                ) : (
                  <p className="px-1 text-sm font-semibold">
                    Tap a tile to stamp it. Tap it again to lift the stamp.
                  </p>
                )}
              </section>
            )}

            <div className="sticky bottom-0 z-10 -mx-3 mt-4 border-t-[3px] border-black bg-ground px-3 py-3 sm:-mx-4 sm:px-4 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 text-xs font-bold leading-tight" aria-live="polite">
                  <span className="display block text-xl">
                    {score.marked} of {TILE_COUNT}
                  </span>
                  stamped{lines}
                </p>
                <button type="button" className="btn btn--primary" onClick={flip}>
                  <FlipIcon />
                  {flipped ? "Back to the board" : "Flip for my scorecard"}
                </button>
              </div>
            </div>

            {!flipped && score.marked > 0 && (
              <div className="mt-3 text-xs font-semibold">
                {confirmClear ? (
                  <p className="flex flex-wrap items-center gap-3">
                    Lift all {score.marked} stamps?
                    <button
                      type="button"
                      className="min-h-[44px] underline"
                      onClick={() => {
                        setMarks(0);
                        setFocused(null);
                        setConfirmClear(false);
                      }}
                    >
                      Yes, clear the card
                    </button>
                    <button type="button" className="min-h-[44px] underline" onClick={() => setConfirmClear(false)}>
                      Keep them
                    </button>
                  </p>
                ) : (
                  <button type="button" className="min-h-[44px] underline" onClick={() => setConfirmClear(true)}>
                    Clear the card
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
