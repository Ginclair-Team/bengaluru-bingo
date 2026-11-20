"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useCartridge, useConsoleKeys } from "@/console/context";
import type { Key } from "@/console/device/controls";
import { Help, PauseMenu, type MenuItem } from "@/console/device/Overlays";
import { LcdHeader } from "@/console/device/Screen";
import { spriteSvg } from "@/lib/pixel";
import { play } from "@/lib/sound";
import {
  CLUE_PREFIX,
  CORRECT_LINE,
  HOW_TO_PLAY,
  INTRO,
  ROUND_PROMPT,
  TITLE,
  WRONG_LINE,
  ZONE_DESCRIPTIONS,
} from "./copy";
import { ZONES, type Landmark, type Zone } from "./data";
import { favoriteZone, gridMaskForCorrect, headlineFor, pickRounds, shareText, zoneLabel } from "./rules";
import { defaultStats, loadStats, saveStats, type Stats } from "./storage";

type Phase = "intro" | "guess" | "reveal" | "summary";
type Overlay = null | "pause" | "help";

const ROUNDS = 5;

const wrap = (n: number, size: number) => (n + size) % size;

function clickRow(list: HTMLUListElement | null, index: number) {
  list?.querySelectorAll("[data-row]")[index]?.querySelector<HTMLElement>("button")?.click();
}

const inertProps = (on: boolean) => (on ? ({ inert: "" } as Record<string, string>) : {});

const u = (n: number) => `calc(${n} * var(--u))`;

const body: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: u(4),
  padding: `${u(4)} ${u(8)}`,
  textAlign: "center",
};

function Art({ landmark, size }: { landmark: Landmark; size: number }) {
  return (
    <div
      className="ws-art"
      style={{ width: u(size), height: u(size), minWidth: size, minHeight: size, flex: "none" }}
      dangerouslySetInnerHTML={{ __html: spriteSvg(landmark.sprite) }}
    />
  );
}

/** Cartridge 2: Which Side, Macha? Guess the zone from the evening drive time. */
export function WhichSideGame() {
  const { host, lcd } = useCartridge();

  const [phase, setPhase] = useState<Phase>("intro");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [rounds, setRounds] = useState<Landmark[]>([]);
  const [round, setRound] = useState(0);
  const [sel, setSel] = useState(0);
  const [pick, setPick] = useState<Zone | null>(null);
  const [correct, setCorrect] = useState(0);
  const [stats, setStats] = useState<Stats>(() => defaultStats());
  const [pauseSel, setPauseSel] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");

  const statsRef = useRef<Stats>(stats);
  const pauseListRef = useRef<HTMLUListElement>(null);
  const zoneListRef = useRef<HTMLUListElement>(null);
  const focusPending = useRef(false);
  const firstFocus = useRef(true);

  // Stats are read after mount, never during render.
  useEffect(() => {
    const loaded = loadStats();
    statsRef.current = loaded;
    setStats(loaded);
  }, []);

  const commitStats = useCallback((next: Stats) => {
    statsRef.current = next;
    setStats(next);
    saveStats(next);
  }, []);

  const current = rounds[round] ?? null;
  const favorite = useMemo(() => favoriteZone(stats), [stats]);

  const go = useCallback(
    (change: () => void) => {
      focusPending.current = true;
      host.transition(change);
    },
    [host]
  );

  const start = useCallback(() => {
    const picked = pickRounds(Math.random, ROUNDS);
    go(() => {
      setRounds(picked);
      setRound(0);
      setSel(0);
      setPick(null);
      setCorrect(0);
      setCopyStatus("");
      setPhase("guess");
    });
    host.setGrille(0);
  }, [go, host]);

  const guess = useCallback(
    (zone: Zone) => {
      if (phase !== "guess" || !current || overlay) return;
      const right = zone === current.zone;
      const prev = statsRef.current;
      const next: Stats = {
        ...prev,
        rounds: prev.rounds + 1,
        correct: prev.correct + (right ? 1 : 0),
        byZone: {
          ...prev.byZone,
          [current.zone]: {
            seen: prev.byZone[current.zone].seen + 1,
            correct: prev.byZone[current.zone].correct + (right ? 1 : 0),
          },
        },
      };
      commitStats(next);
      const total = correct + (right ? 1 : 0);
      setCorrect(total);
      setPick(zone);
      setSel(ZONES.indexOf(zone));
      host.setGrille(gridMaskForCorrect(total));
      play(right ? "stamp" : "error");
      host.announce(
        right
          ? `${CORRECT_LINE}. ${current.label} is in ${zoneLabel(current.zone)}. ${current.fact}`
          : `${WRONG_LINE.replace("{ZONE}", zoneLabel(current.zone))}. ${current.label}. ${current.fact}`
      );
      focusPending.current = true;
      setPhase("reveal");
    },
    [phase, current, overlay, correct, commitStats, host]
  );

  const next = useCallback(() => {
    if (round + 1 < ROUNDS) {
      go(() => {
        setRound(round + 1);
        setSel(0);
        setPick(null);
        setPhase("guess");
      });
      return;
    }
    const prev = statsRef.current;
    commitStats({ ...prev, runs: prev.runs + 1 });
    go(() => {
      setPhase("summary");
    });
    host.announce(`${headlineFor(correct)} ${correct} of ${ROUNDS} correct.`);
    if (correct === ROUNDS) {
      host.flashLed();
      play("bingo");
    }
  }, [round, go, commitStats, host, correct]);

  const copyResult = useCallback(async () => {
    const text = shareText(correct, favoriteZone(statsRef.current));
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("COPIED!");
      host.announce("Result copied.");
    } catch {
      setCopyStatus("COULD NOT COPY");
      host.announce("Could not copy the result.");
    }
  }, [correct, host]);

  // ---- Overlays ----
  const openOverlay = useCallback((o: Exclude<Overlay, null>) => {
    if (o === "pause") setPauseSel(0);
    focusPending.current = true;
    setOverlay(o);
    play("open");
  }, []);

  const closeOverlay = useCallback(() => {
    focusPending.current = true;
    setOverlay(null);
    play("close");
  }, []);

  const pauseItems: MenuItem[] = [
    { id: "help", label: "How to play" },
    { id: "sound", label: `Sound: ${host.muted ? "off" : "on"}` },
    { id: "quit", label: "Quit to menu" },
    { id: "resume", label: "Resume" },
  ];

  const activatePause = (i: number) => {
    const id = pauseItems[i].id;
    if (id === "help") openOverlay("help");
    else if (id === "sound") host.toggleSound();
    else if (id === "quit") host.exit();
    else closeOverlay();
  };

  const isDir = (key: Key) => key === "up" || key === "down" || key === "left" || key === "right";

  const press = (key: Key) => {
    if (overlay === "pause") {
      if (key === "up" || key === "down") {
        focusPending.current = true;
        setPauseSel((s) => wrap(s + (key === "down" ? 1 : -1), pauseItems.length));
        play("move");
      } else if (key === "a" || key === "continue") clickRow(pauseListRef.current, pauseSel);
      else if (key === "b" || key === "menu") closeOverlay();
      return;
    }
    if (overlay === "help") {
      if (!isDir(key)) {
        focusPending.current = true;
        setOverlay("pause");
        play("close");
      }
      return;
    }
    if (key === "menu") {
      openOverlay("pause");
      return;
    }
    if (phase === "intro") {
      if (key === "a" || key === "continue") start();
      else if (key === "b") host.exit();
    } else if (phase === "guess") {
      if (isDir(key)) {
        const step = key === "down" || key === "right" ? 1 : -1;
        focusPending.current = true;
        setSel((s) => wrap(s + step, ZONES.length));
        play("move");
      } else if (key === "a" || key === "continue") guess(ZONES[sel]);
      else if (key === "b") play("error");
    } else if (phase === "reveal") {
      if (key === "a" || key === "continue") next();
      else if (key === "b") play("error");
    } else if (phase === "summary") {
      if (key === "a" || key === "continue") start();
      else if (key === "b") host.exit();
    }
  };

  useConsoleKeys(press);

  // ---- Focus stays on the selected row or the primary button ----
  useEffect(() => {
    const first = firstFocus.current;
    firstFocus.current = false;
    if (first && !focusPending.current) return;
    if (!focusPending.current) return;
    focusPending.current = false;
    const root = lcd.current;
    if (!root) return;
    const scope = overlay ? ".overlay " : "";
    const el = root.querySelector<HTMLElement>(`${scope}[data-autofocus="true"]`);
    el?.focus({ preventScroll: true });
  }, [phase, sel, pauseSel, overlay, round, lcd]);

  // What A and B do on the screen showing now.
  let legendA = "";
  let legendB = "";
  if (overlay === "pause") {
    legendA = "PICK";
    legendB = "BACK";
  } else if (overlay === "help") {
    legendB = "BACK";
  } else if (phase === "intro") {
    legendA = "PLAY";
    legendB = "QUIT";
  } else if (phase === "guess") {
    legendA = "GUESS";
  } else if (phase === "reveal") {
    legendA = round + 1 < ROUNDS ? "NEXT" : "RESULT";
  } else if (phase === "summary") {
    legendA = "PLAY";
    legendB = "QUIT";
  }
  useEffect(() => {
    host.setLegends({ a: legendA, b: legendB });
  }, [host, legendA, legendB]);

  const rowStyle: CSSProperties = { height: u(28), minHeight: 26 };

  return (
    <>
      <div style={{ position: "absolute", inset: 0 }} {...inertProps(overlay !== null)}>
        {phase === "intro" && (
          <div className="lcd-screen">
            <LcdHeader title={TITLE.toUpperCase()} />
            <div style={body}>
              <h1 className="t-display-l" style={{ margin: 0 }}>
                WHICH SIDE, MACHA?
              </h1>
              <p className="t-body-lcd" style={{ margin: 0 }}>
                {INTRO}
              </p>
            </div>
            <div className="result-actions">
              <button type="button" className="lcd-btn lcd-btn--primary" data-autofocus="true" onClick={start}>
                <span className="key t-label" aria-hidden="true">
                  A
                </span>
                PLAY
              </button>
              <button type="button" className="lcd-btn" onClick={() => host.exit()}>
                <span className="key t-label" aria-hidden="true">
                  B
                </span>
                QUIT
              </button>
            </div>
          </div>
        )}

        {phase === "guess" && current && (
          <div className="lcd-screen">
            <LcdHeader title={`ROUND ${round + 1}/${ROUNDS}`} />
            <div style={{ ...body, flex: "none", paddingBottom: 0 }}>
              <Art landmark={current} size={44} />
              <h2 className="t-display-s" style={{ margin: 0 }}>
                {current.label}
              </h2>
              <p className="t-label" style={{ margin: 0 }}>
                {CLUE_PREFIX} {current.band === "UNDER 20" ? "UNDER 20 MIN" : current.band}
              </p>
              <p className="t-ui-l" style={{ margin: 0, fontSize: "max(10px, calc(11 * var(--u)))" }}>
                {ROUND_PROMPT}
              </p>
            </div>
            <ul className="menu" ref={zoneListRef} aria-label="Zones" style={{ padding: `0 ${u(4)}` }}>
              {ZONES.map((zone, i) => (
                <li key={zone} data-row>
                  <button
                    type="button"
                    className="menu-row"
                    data-selected={sel === i}
                    data-autofocus={sel === i}
                    style={{ ...rowStyle, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 0, paddingLeft: u(18) }}
                    onFocus={() => setSel(i)}
                    onClick={() => guess(zone)}
                  >
                    <span className="caret" aria-hidden="true">
                      {">"}
                    </span>
                    <span className="t-ui-l" style={{ fontSize: "max(10px, calc(11 * var(--u)))" }}>
                      {zoneLabel(zone)}
                    </span>
                    <span className="t-label" style={{ textTransform: "none" }}>
                      {ZONE_DESCRIPTIONS[zone]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {phase === "reveal" && current && pick && (
          <div className="lcd-screen">
            <LcdHeader title={`ROUND ${round + 1}/${ROUNDS}`} />
            <div style={body}>
              <Art landmark={current} size={40} />
              <h2 className="t-display-s" style={{ margin: 0 }}>
                {pick === current.zone ? CORRECT_LINE : WRONG_LINE.replace("{ZONE}", zoneLabel(current.zone))}
              </h2>
              <p className="t-ui-l" style={{ margin: 0, fontSize: "max(10px, calc(11 * var(--u)))" }}>
                {current.label}: {zoneLabel(current.zone)}
              </p>
              <p className="t-body-lcd" style={{ margin: 0 }}>
                {current.fact}
              </p>
            </div>
            <div className="result-actions">
              <button type="button" className="lcd-btn lcd-btn--primary" data-autofocus="true" onClick={next}>
                <span className="key t-label" aria-hidden="true">
                  A
                </span>
                {round + 1 < ROUNDS ? "NEXT" : "RESULT"}
              </button>
            </div>
          </div>
        )}

        {phase === "summary" && (
          <div className="lcd-screen">
            <LcdHeader title="RESULT" />
            <div style={body}>
              <h2 className="t-display-l" style={{ margin: 0 }}>
                {headlineFor(correct)}
              </h2>
              <p className="t-ui-l" style={{ margin: 0, fontSize: "max(10px, calc(12 * var(--u)))" }}>
                {correct} / {ROUNDS} CORRECT
              </p>
              <p className="t-label" style={{ margin: 0 }}>
                FAVORITE ZONE: {favorite ? zoneLabel(favorite) : "NONE YET"}
              </p>
              <p className="t-label" style={{ margin: 0 }}>
                CORRECT GUESSES: {stats.correct} OF {stats.rounds}
              </p>
              <p role="status" className="t-label" style={{ margin: 0, minHeight: "1.2em" }}>
                {copyStatus}
              </p>
            </div>
            <div className="result-actions">
              <button type="button" className="lcd-btn lcd-btn--primary" data-autofocus="true" onClick={start}>
                <span className="key t-label" aria-hidden="true">
                  A
                </span>
                PLAY AGAIN
              </button>
              <button type="button" className="lcd-btn" onClick={() => void copyResult()}>
                COPY RESULT
              </button>
              <button type="button" className="lcd-btn" onClick={() => host.exit()}>
                <span className="key t-label" aria-hidden="true">
                  B
                </span>
                QUIT
              </button>
            </div>
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
    </>
  );
}
