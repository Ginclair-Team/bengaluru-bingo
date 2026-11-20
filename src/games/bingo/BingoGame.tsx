"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useCartridge, useConsoleKeys } from "@/console/context";
import type { Key } from "@/console/device/controls";
import { ConfirmDialog, Help, LinkInfo, PauseMenu, type MenuItem } from "@/console/device/Overlays";
import { LcdHeader } from "@/console/device/Screen";
import { HAPTIC, play, vibrate } from "@/lib/sound";
import { Board, type Celebration } from "./Board";
import { categoryGlyphSvg } from "./cards/glyphs";
import { Scorecard } from "./cards/Scorecard";
import { SharePanel, copyCardLink, type ShareStatus } from "./SharePanel";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  TILE_COUNT,
  bingoLines,
  decodeMarks,
  isMarked,
  scoreFor,
  toggleMark,
  type Marks,
  type Score,
} from "./rules";
import { loadGame, saveGame } from "./storage";

export const FRIEND_KEY = "bb:friend";

type ScreenId = "board" | "result" | "share";
type OverlayId = null | "pause" | "help" | "confirmClear" | "linkInfo";
type Dir = "up" | "down" | "left" | "right";

const HOW_TO_PLAY =
  "Stamp every Bengaluru thing you have actually done. Press CONTINUE to see how native you are.";

const isDir = (key: Key): key is Dir => key === "up" || key === "down" || key === "left" || key === "right";

// Hidden faces must not take focus or be read out.
const inertProps = (on: boolean) => (on ? ({ inert: "" } as Record<string, string>) : {});

function lineName(line: number[]): string {
  const [a, b] = line;
  if (Math.floor(a / 5) === Math.floor(b / 5)) return `Row ${Math.floor(a / 5) + 1}`;
  if (a % 5 === b % 5) return `Column ${(a % 5) + 1}`;
  return a === 0 ? "The main diagonal" : "The other diagonal";
}

function clickRow(list: HTMLUListElement | null, index: number) {
  const row = list?.querySelectorAll("[data-row]")[index];
  row?.querySelector<HTMLElement>("button, a")?.click();
}

function wrap(n: number, size: number) {
  return (n + size) % size;
}

/** Cartridge 1: Bengaluru Bingo. The board, the scorecard, sharing and clubbing. */
export function BingoGame() {
  const { host, lcd, side } = useCartridge();

  const [marks, setMarks] = useState<Marks>(0);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [friendCode, setFriendCode] = useState<string | null>(null);

  // Old card links open straight onto the scorecard (the console sets this up).
  const [screen, setScreen] = useState<ScreenId>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "card"
      ? "result"
      : "board"
  );
  const [overlay, setOverlay] = useState<OverlayId>(null);

  const [cursor, setCursor] = useState(12);
  const [hover, setHover] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [fresh, setFresh] = useState<{ index: number; n: number } | null>(null);
  const [celebrate, setCelebrate] = useState<Celebration | null>(null);

  const [shareSel, setShareSel] = useState(0);
  const [pauseSel, setPauseSel] = useState(0);
  const [dlgSel, setDlgSel] = useState<0 | 1>(0);
  const [status, setStatus] = useState<ShareStatus>({ kind: "idle" });

  const cardRef = useRef<HTMLDivElement>(null);
  const shareListRef = useRef<HTMLUListElement>(null);
  const pauseListRef = useRef<HTMLUListElement>(null);

  const reduced = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);
  const focusSel = useRef(false);
  const focusGrid = useRef(false);
  const restoreFocus = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const firstFocus = useRef(true);

  const score = useMemo(() => scoreFor(marks), [marks]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    };
  }, []);

  // ---- Start up: saved card, restore link, friend ----
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

    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (anonymousId) saveGame(anonymousId, marks);
  }, [anonymousId, marks]);

  // The speaker grille mirrors the stamped tiles.
  useEffect(() => {
    host.setGrille(marks);
  }, [host, marks]);

  // ---- Screen changes go through the console's wipe ----
  const go = useCallback(
    (next: ScreenId, afterSwap?: () => void) => {
      host.transition(() => {
        setScreen(next);
        afterSwap?.();
      });
    },
    [host]
  );

  // ---- Overlays ----
  const openOverlay = useCallback(
    (next: Exclude<OverlayId, null>) => {
      if (!overlay) returnFocus.current = document.activeElement as HTMLElement | null;
      setOverlay(next);
      if (next === "pause") setPauseSel(0);
      setDlgSel(0);
      play("open");
    },
    [overlay]
  );

  const closeOverlay = useCallback(() => {
    setOverlay(null);
    restoreFocus.current = true;
    play("close");
  }, []);

  // ---- Playing ----
  const celebrateLines = useCallback(
    (next: Marks, newLines: number[][]) => {
      const full = next === 2 ** TILE_COUNT - 1;
      const source = full ? bingoLines(next) : newLines;
      const cells: number[] = [];
      source.forEach((line) => line.forEach((i) => !cells.includes(i) && cells.push(i)));
      counter.current += 1;
      setCelebrate({ id: counter.current, cells, banner: full ? "NAMMA LEGEND!" : "BINGO!", full });
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      celebrateTimer.current = setTimeout(() => setCelebrate(null), 1200);
      host.flashLed();
      later(() => {
        play("bingo");
        vibrate(HAPTIC.bingo);
      }, 160);
      const total = bingoLines(next).length;
      host.announce(
        full
          ? "Namma legend! The whole card is stamped."
          : `Bingo! ${newLines.map(lineName).join(" and ")} complete. ${total} line${total === 1 ? "" : "s"} so far.`
      );
    },
    [host, later]
  );

  const stampTile = useCallback(
    (index: number) => {
      const was = isMarked(marks, index);
      const next = toggleMark(marks, index);
      setMarks(next);
      setCursor(index);
      setHover(null);
      setTouched(true);
      counter.current += 1;
      setFresh({ index, n: counter.current });
      play(was ? "lift" : "stamp");
      vibrate(was ? HAPTIC.lift : HAPTIC.stamp);
      if (!was) {
        const before = bingoLines(marks).map((l) => l.join(","));
        const added = bingoLines(next).filter((l) => !before.includes(l.join(",")));
        if (added.length > 0) celebrateLines(next, added);
      }
    },
    [marks, celebrateLines]
  );

  const moveCursor = useCallback(
    (dir: Dir) => {
      let r = Math.floor(cursor / 5);
      let c = cursor % 5;
      if (dir === "up") r = wrap(r - 1, 5);
      if (dir === "down") r = wrap(r + 1, 5);
      if (dir === "left") c = wrap(c - 1, 5);
      if (dir === "right") c = wrap(c + 1, 5);
      const active = document.activeElement;
      focusGrid.current = !!active && !!active.closest?.('[role="grid"]');
      setCursor(r * 5 + c);
      setHover(null);
      setTouched(true);
      play("move");
    },
    [cursor]
  );

  const openResult = useCallback(() => {
    go("result", () => {
      if (!anonymousId) return;
      // Best effort. Until a database is connected this is a no-op.
      fetch("/api/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ anonymous_id: anonymousId, card_code: score.code }),
      }).catch(() => {});
    });
  }, [go, anonymousId, score.code]);

  const openShare = useCallback(() => {
    setStatus({ kind: "idle" });
    setShareSel(0);
    go("share");
  }, [go]);

  const clearCard = useCallback(() => {
    setMarks(0);
    setOverlay(null);
    restoreFocus.current = true;
    play("lift");
    host.announce("Card cleared.");
  }, [host]);

  const copyFromDialog = useCallback(async () => {
    const result = await copyCardLink(score.code);
    setStatus(result);
    if (result.kind === "ok") {
      setOverlay(null);
      restoreFocus.current = true;
    }
  }, [score.code]);

  const pauseItems: MenuItem[] = [
    { id: "help", label: "How to play" },
    { id: "sound", label: `Sound: ${host.muted ? "off" : "on"}` },
    { id: "clear", label: "Clear card", disabled: score.marked === 0 },
    { id: "quit", label: "Quit to menu" },
    { id: "resume", label: "Resume" },
  ];

  const activatePause = (i: number) => {
    const id = pauseItems[i].id;
    if (id === "help") openOverlay("help");
    else if (id === "sound") host.toggleSound();
    else if (id === "clear") {
      if (score.marked === 0) play("error");
      else openOverlay("confirmClear");
    } else if (id === "quit") host.exit();
    else closeOverlay();
  };

  // ---- The controls map (the console forwards every key here) ----
  const press = (key: Key) => {
    if (overlay === "pause") {
      if (key === "up" || key === "down") {
        focusSel.current = true;
        setPauseSel((s) => wrap(s + (key === "down" ? 1 : -1), pauseItems.length));
        play("move");
      } else if (key === "a" || key === "continue") clickRow(pauseListRef.current, pauseSel);
      else if (key === "b" || key === "menu") closeOverlay();
      return;
    }
    if (overlay === "help") {
      if (!isDir(key)) {
        setOverlay("pause");
        play("close");
      }
      return;
    }
    if (overlay === "confirmClear") {
      if (isDir(key)) {
        focusSel.current = true;
        setDlgSel((s) => (s === 0 ? 1 : 0));
        play("move");
      } else if (key === "a" || key === "continue") {
        if (dlgSel === 0) {
          setOverlay("pause");
          play("close");
        } else clearCard();
      } else {
        setOverlay("pause");
        play("close");
      }
      return;
    }
    if (overlay === "linkInfo") {
      if (key === "a" || key === "continue") void copyFromDialog();
      else if (!isDir(key)) closeOverlay();
      return;
    }

    if (screen === "board") {
      if (isDir(key)) moveCursor(key);
      else if (key === "a") stampTile(cursor);
      else if (key === "b") {
        if (isMarked(marks, cursor)) stampTile(cursor);
        else play("error");
      } else if (key === "continue") openResult();
      else openOverlay("pause");
    } else if (screen === "result") {
      if (key === "a" || key === "continue") openShare();
      else if (key === "b") go("board");
      else if (key === "menu") openOverlay("pause");
    } else if (screen === "share") {
      if (key === "up" || key === "down") {
        focusSel.current = true;
        setShareSel((s) => wrap(s + (key === "down" ? 1 : -1), 6));
        play("move");
      } else if (key === "a" || key === "continue") clickRow(shareListRef.current, shareSel);
      else if (key === "b" || key === "menu") go("result");
    }
  };

  useConsoleKeys(press);

  // What A and B do on the screen showing now.
  const marked = isMarked(marks, cursor);
  let legendA = "";
  let legendB = "";
  if (overlay === "pause") {
    legendA = "PICK";
    legendB = "BACK";
  } else if (overlay === "help") {
    legendB = "BACK";
  } else if (overlay === "confirmClear") {
    legendA = "PICK";
    legendB = "BACK";
  } else if (overlay === "linkInfo") {
    legendA = "COPY";
    legendB = "BACK";
  } else if (screen === "board") {
    legendA = marked ? "LIFT" : "STAMP";
    legendB = marked ? "LIFT" : "";
  } else if (screen === "result") {
    legendA = "SHARE";
    legendB = "BOARD";
  } else if (screen === "share") {
    legendA = "PICK";
    legendB = "BACK";
  }
  useEffect(() => {
    host.setLegends({ a: legendA, b: legendB });
  }, [host, legendA, legendB]);

  // ---- Focus management, inside the LCD ----
  const focusIn = useCallback((el: Element | null) => {
    if (!el) return;
    const target = el instanceof HTMLLIElement ? el.querySelector<HTMLElement>("button, a") : (el as HTMLElement);
    target?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const root = lcd.current;
    const first = firstFocus.current;
    firstFocus.current = false;
    if (!root) return;
    if (overlay) {
      focusIn(root.querySelector('.overlay [data-autofocus="true"]'));
      return;
    }
    if (restoreFocus.current) {
      restoreFocus.current = false;
      const r = returnFocus.current;
      if (r && r.isConnected) {
        r.focus({ preventScroll: true });
        return;
      }
    }
    if (first) return;
    const active = document.activeElement;
    if (!active || active === document.body || root.contains(active)) {
      focusIn(root.querySelector('[data-autofocus="true"]'));
    }
  }, [screen, overlay, lcd, focusIn]);

  useEffect(() => {
    if (!focusSel.current) return;
    focusSel.current = false;
    focusIn(lcd.current?.querySelector(`${overlay ? ".overlay " : ""}[data-autofocus="true"]`) ?? null);
  }, [shareSel, pauseSel, dlgSel, overlay, lcd, focusIn]);

  useEffect(() => {
    if (!focusGrid.current) return;
    focusGrid.current = false;
    lcd.current?.querySelector<HTMLElement>(`[data-cell="${cursor}"]`)?.focus({ preventScroll: true });
  }, [cursor, lcd]);

  const onTap = useCallback(
    (index: number) => {
      if (screen !== "board" || overlay) return;
      stampTile(index);
    },
    [screen, overlay, stampTile]
  );

  const stampedWords = score.lines === 0 ? "" : `, ${score.lines} bingo line${score.lines === 1 ? "" : "s"}`;

  return (
    <>
      <div style={{ position: "absolute", inset: 0 }} {...inertProps(overlay !== null)}>
        {screen === "board" && (
          <Board
            marks={marks}
            cursor={cursor}
            hover={hover}
            touched={touched}
            lines={score.lines}
            fresh={fresh}
            celebrate={celebrate}
            onTap={onTap}
            onHover={setHover}
          />
        )}

        {screen === "result" && (
          <div className="lcd-screen">
            <LcdHeader title="YOUR CARD" code={score.code} />
            <div className="result-body">
              <Scorecard score={score} className="scorecard result-card" />
            </div>
            <p className="sr-only-live">
              You are {score.percent}% Bengaluru native, {score.badge}. {score.marked} of {TILE_COUNT} tiles stamped
              {stampedWords}.
            </p>
            <div className="result-actions">
              <button type="button" className="lcd-btn lcd-btn--primary" data-autofocus="true" onClick={openShare}>
                <span className="key t-label" aria-hidden="true">
                  A
                </span>
                Share
              </button>
              <button type="button" className="lcd-btn" onClick={() => go("board")}>
                <span className="key t-label" aria-hidden="true">
                  B
                </span>
                Board
              </button>
            </div>
          </div>
        )}

        {screen === "share" && (
          <div className="lcd-screen">
            <LcdHeader title="SHARE" code={score.code} />
            <SharePanel
              score={score}
              cardRef={cardRef}
              friendCode={friendCode}
              selected={shareSel}
              onSelect={setShareSel}
              status={status}
              setStatus={setStatus}
              onLinkInfo={() => openOverlay("linkInfo")}
              onBack={() => go("board")}
              listRef={shareListRef}
            />
          </div>
        )}
      </div>

      {overlay === "pause" && (
        <PauseMenu
          items={pauseItems}
          selected={pauseSel}
          onSelect={setPauseSel}
          onActivate={activatePause}
          listRef={pauseListRef}
        />
      )}
      {overlay === "help" && <Help text={HOW_TO_PLAY} onClose={() => setOverlay("pause")} />}
      {overlay === "confirmClear" && (
        <ConfirmDialog
          question={`Lift all ${score.marked} stamp${score.marked === 1 ? "" : "s"}?`}
          keep="Keep them"
          confirm="Yes, clear"
          selected={dlgSel}
          onSelect={setDlgSel}
          onKeep={() => setOverlay("pause")}
          onConfirm={clearCard}
        />
      )}
      {overlay === "linkInfo" && (
        <LinkInfo
          title="Link cable"
          body="Send your link to a friend. When they stamp their own card, the two join into one Bingo Journey: what you've both done, and what to try together."
          status={status.kind === "idle" ? "" : status.message}
          onCopy={copyFromDialog}
        />
      )}

      {/* The desk column: the save file, beside the console on desktop. */}
      {side && createPortal(<SaveFile score={score} />, side)}

      {/* The hidden card that the Save image button captures. */}
      {screen === "share" &&
        createPortal(
          <div className="save-stage" aria-hidden="true">
            <div ref={cardRef}>
              <Scorecard score={score} className="scorecard" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function SaveFile({ score }: { score: Score }) {
  return (
    <section className="panel mt-4" aria-labelledby="save-title">
      <div className="panel__head" style={{ "--strip": "var(--shell)" } as CSSProperties}>
        <h2 id="save-title" className="t-ui-l">
          Save file
        </h2>
      </div>
      <p className="t-ui-l" style={{ margin: 0 }} aria-live="polite">
        {score.marked}/{TILE_COUNT} stamped
        <span className="t-body" style={{ marginLeft: 12 }}>
          {score.lines} bingo line{score.lines === 1 ? "" : "s"}
        </span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {CATEGORY_ORDER.map((id) => (
          <li key={id} className="chip t-label" style={{ background: `var(--cat-${id})`, padding: "4px 6px", gap: 6 }}>
            <span className="glyph" dangerouslySetInnerHTML={{ __html: categoryGlyphSvg(id) }} />
            {CATEGORIES[id].label} {score.byCategory[id]}
          </li>
        ))}
      </ul>
    </section>
  );
}
