"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Board, type Celebration } from "@/components/Board";
import { Scorecard } from "@/components/Cards/Scorecard";
import { categoryGlyphSvg } from "@/components/Cards/glyphs";
import { BootScreen } from "@/components/device/BootScreen";
import { CONTROLS, KEYMAP, type Key } from "@/components/device/controls";
import { Device } from "@/components/device/Device";
import { ConfirmClear, Help, LinkInfo, PauseMenu, type MenuItem } from "@/components/device/Overlays";
import { LcdHeader, Screen, type WipePhase } from "@/components/device/Screen";
import { SharePanel, copyCardLink, type ShareStatus } from "@/components/SharePanel";
import { SiteFooter } from "@/components/SiteHeader";
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
} from "@/lib/game";
import {
  HAPTIC,
  isMuted,
  loadMuted,
  play,
  setMuted as persistMuted,
  unlockAudio,
  vibrate,
} from "@/lib/sound";
import { loadGame, saveGame } from "@/lib/storage";

export const FRIEND_KEY = "bb:friend";
const BOOTED_KEY = "bb:booted";

type ScreenId = "boot" | "board" | "result" | "share";
type OverlayId = null | "pause" | "help" | "confirmClear" | "linkInfo";

// Hidden screens must not take focus or be read out.
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

export function Game() {
  const [marks, setMarks] = useState<Marks>(0);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [friendCode, setFriendCode] = useState<string | null>(null);

  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<ScreenId>("boot");
  const [overlay, setOverlay] = useState<OverlayId>(null);
  const [wipe, setWipe] = useState<WipePhase>(null);
  const [ledOn, setLedOn] = useState(false);

  const [cursor, setCursor] = useState(12);
  const [hover, setHover] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [fresh, setFresh] = useState<{ index: number; n: number } | null>(null);
  const [celebrate, setCelebrate] = useState<Celebration | null>(null);

  const [shareSel, setShareSel] = useState(0);
  const [pauseSel, setPauseSel] = useState(0);
  const [dlgSel, setDlgSel] = useState<0 | 1>(0);
  const [status, setStatus] = useState<ShareStatus>({ kind: "idle" });

  const [muted, setMutedState] = useState(false);
  const [pressed, setPressed] = useState<Partial<Record<Key, boolean>>>({});
  const [announcement, setAnnouncement] = useState("");

  const lcdRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareListRef = useRef<HTMLUListElement>(null);
  const pauseListRef = useRef<HTMLUListElement>(null);

  const busy = useRef(false);
  const reduced = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);
  const shiftClean = useRef(false);
  const focusSel = useRef(false);
  const focusGrid = useRef(false);
  const restoreFocus = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const prevScreen = useRef<ScreenId>("boot");

  const score = useMemo(() => scoreFor(marks), [marks]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const announce = useCallback((message: string) => {
    setAnnouncement((prev) => (prev === message ? `${message} ` : message));
  }, []);

  // ---- Start up: saved card, restore link, friend, boot decision ----
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
    setMutedState(loadMuted());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onMq = () => {
      reduced.current = mq.matches;
    };
    mq.addEventListener?.("change", onMq);

    let booted = false;
    try {
      booted = sessionStorage.getItem(BOOTED_KEY) === "1";
    } catch {
      // Treat as first visit.
    }
    if (params.get("view") === "card") {
      setScreen("result");
      setLedOn(true);
    } else if (booted || mq.matches) {
      setScreen("board");
      setLedOn(true);
    }
    setReady(true);

    const pending = timers.current;
    return () => {
      mq.removeEventListener?.("change", onMq);
      pending.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (anonymousId) saveGame(anonymousId, marks);
  }, [anonymousId, marks]);

  // Audio may only start after a gesture.
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio, { capture: true });
    return () => window.removeEventListener("pointerdown", unlockAudio, { capture: true });
  }, []);

  // ---- Screen changes: eight-blind wipe, or an instant swap ----
  const go = useCallback(
    (next: ScreenId, afterSwap?: () => void) => {
      if (busy.current) return;
      play("screen");
      if (reduced.current) {
        setScreen(next);
        afterSwap?.();
        return;
      }
      busy.current = true;
      setWipe("close");
      later(() => {
        setScreen(next);
        afterSwap?.();
        setWipe("open");
        later(() => {
          setWipe(null);
          busy.current = false;
        }, 120);
      }, 120);
    },
    [later]
  );

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
    } catch {
      // Boots again next load; harmless.
    }
    setLedOn(true);
    go("board", () => announce("Bengaluru Bingo ready"));
  }, [go, announce]);

  // ---- Overlays ----
  const openOverlay = useCallback((next: Exclude<OverlayId, null>) => {
    if (!overlay) returnFocus.current = document.activeElement as HTMLElement | null;
    setOverlay(next);
    if (next === "pause") setPauseSel(0);
    setDlgSel(0);
    play("open");
  }, [overlay]);

  const closeOverlay = useCallback(() => {
    setOverlay(null);
    restoreFocus.current = true;
    play("close");
  }, []);

  // ---- Sound ----
  const toggleMute = useCallback(() => {
    const next = !isMuted();
    persistMuted(next);
    setMutedState(next);
    unlockAudio();
    if (!next) play("open");
    announce(next ? "Sound and haptics off" : "Sound and haptics on");
  }, [announce]);

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
      later(() => {
        play("bingo");
        vibrate(HAPTIC.bingo);
      }, 160);
      const total = bingoLines(next).length;
      announce(
        full
          ? "Namma legend! The whole card is stamped."
          : `Bingo! ${newLines.map(lineName).join(" and ")} complete. ${total} line${total === 1 ? "" : "s"} so far.`
      );
    },
    [announce, later]
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
    (dir: "up" | "down" | "left" | "right") => {
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
    announce("Card cleared.");
  }, [announce]);

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
    { id: "sound", label: `Sound: ${muted ? "off" : "on"}` },
    { id: "clear", label: "Clear card", disabled: score.marked === 0 },
    { id: "resume", label: "Resume" },
  ];

  const activatePause = (i: number) => {
    if (i === 0) openOverlay("help");
    else if (i === 1) toggleMute();
    else if (i === 2) {
      if (score.marked === 0) play("error");
      else openOverlay("confirmClear");
    } else closeOverlay();
  };

  // ---- The controls map ----
  const press = (key: Key) => {
    if (screen === "boot") {
      if (ready) finishBoot();
      return;
    }
    if (busy.current) return;
    const dir = key === "up" || key === "down" || key === "left" || key === "right";

    if (overlay === "pause") {
      if (key === "up" || key === "down") {
        focusSel.current = true;
        setPauseSel((s) => wrap(s + (key === "down" ? 1 : -1), pauseItems.length));
        play("move");
      } else if (key === "a" || key === "start") clickRow(pauseListRef.current, pauseSel);
      else if (key === "b" || key === "select") closeOverlay();
      return;
    }
    if (overlay === "help") {
      if (!dir) {
        setOverlay("pause");
        play("close");
      }
      return;
    }
    if (overlay === "confirmClear") {
      if (dir) {
        focusSel.current = true;
        setDlgSel((s) => (s === 0 ? 1 : 0));
        play("move");
      } else if (key === "a" || key === "start") {
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
      if (key === "a" || key === "start") void copyFromDialog();
      else if (!dir) closeOverlay();
      return;
    }

    if (screen === "board") {
      if (dir) moveCursor(key);
      else if (key === "a") stampTile(cursor);
      else if (key === "b") {
        if (isMarked(marks, cursor)) stampTile(cursor);
        else play("error");
      } else if (key === "start") openResult();
      else openOverlay("pause");
    } else if (screen === "result") {
      if (key === "a" || key === "start") openShare();
      else if (key === "b") go("board");
      else if (key === "select") openOverlay("pause");
    } else if (screen === "share") {
      if (key === "up" || key === "down") {
        focusSel.current = true;
        setShareSel((s) => wrap(s + (key === "down" ? 1 : -1), 6));
        play("move");
      } else if (key === "a" || key === "start") clickRow(shareListRef.current, shareSel);
      else if (key === "b" || key === "select") go("result");
    }
  };

  // Always the latest closures, so the key listener is registered once.
  const skipBoot = () => {
    if (screen === "boot" && ready) finishBoot();
  };
  const api = useRef({ press, toggleMute, skipBoot });
  api.current = { press, toggleMute, skipBoot };
  const onPress = useCallback((key: Key) => api.current.press(key), []);

  const flashKey = useCallback((key: Key, on: boolean) => {
    setPressed((p) => ({ ...p, [key]: on }));
  }, []);

  // ---- Keyboard: scoped so it never eats typing or browser shortcuts ----
  useEffect(() => {
    const releaseLater = (key: Key) => window.setTimeout(() => flashKey(key, false), 90);

    const onKeyDown = (e: KeyboardEvent) => {
      unlockAudio();
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      if (e.key === "Shift") {
        if (!e.repeat) shiftClean.current = true;
        return;
      }
      if (e.shiftKey) shiftClean.current = false;
      if (e.key === "Tab") return;

      const lower = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (lower === "m") {
        if (!e.repeat) api.current.toggleMute();
        return;
      }

      const key = KEYMAP[lower];
      const activator = lower === "Enter" || lower === " ";
      if (activator && t) {
        // Native activation for links and for buttons that are not tiles.
        if (t.closest("a[href]")) return;
        // (Hardware keys are buttons too: their own click does the work.)
        const btn = t.closest("button, [role='button']");
        if (btn && !btn.closest("[data-tile]")) return;
      }
      if (!key) {
        // During boot any key skips it.
        if (e.key.length === 1) api.current.skipBoot();
        return;
      }
      e.preventDefault();
      const direction = key === "up" || key === "down" || key === "left" || key === "right";
      if (e.repeat && !direction) return;
      flashKey(key, true);
      api.current.press(key);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        if (shiftClean.current) {
          shiftClean.current = false;
          flashKey("select", true);
          api.current.press("select");
          releaseLater("select");
        }
        return;
      }
      const lower = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const key = KEYMAP[lower];
      if (key) releaseLater(key);
    };

    const onBlur = () => setPressed({});

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [flashKey]);

  // ---- Focus management ----
  const focusIn = useCallback((el: Element | null) => {
    if (!el) return;
    const target = el instanceof HTMLLIElement ? el.querySelector<HTMLElement>("button, a") : (el as HTMLElement);
    target?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const lcd = lcdRef.current;
    const was = prevScreen.current;
    prevScreen.current = screen;
    if (!ready || !lcd || screen === "boot") return;
    if (overlay) {
      focusIn(lcd.querySelector('.overlay [data-autofocus="true"]'));
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
    if (was === "boot") return;
    const active = document.activeElement;
    if (!active || active === document.body || lcd.contains(active)) {
      focusIn(lcd.querySelector('[data-autofocus="true"]'));
    }
  }, [screen, overlay, ready, focusIn]);

  useEffect(() => {
    if (!focusSel.current) return;
    focusSel.current = false;
    focusIn(lcdRef.current?.querySelector(`${overlay ? ".overlay " : ""}[data-autofocus="true"]`) ?? null);
  }, [shareSel, pauseSel, dlgSel, overlay, focusIn]);

  useEffect(() => {
    if (!focusGrid.current) return;
    focusGrid.current = false;
    lcdRef.current?.querySelector<HTMLElement>(`[data-tile="${cursor}"]`)?.focus({ preventScroll: true });
  }, [cursor]);

  const onTap = useCallback(
    (index: number) => {
      if (screen !== "board" || overlay || busy.current) return;
      stampTile(index);
    },
    [screen, overlay, stampTile]
  );

  // ---- Render ----
  const stampedWords =
    score.lines === 0 ? "" : `, ${score.lines} bingo line${score.lines === 1 ? "" : "s"}`;

  return (
    <>
      <a href="#game" className="skip-link">
        Skip to the game
      </a>
      <main className="mx-auto flex w-full max-w-[1040px] flex-col items-center px-2 pb-8 pt-2 lg:min-h-[100dvh] lg:flex-row lg:justify-center lg:gap-14 lg:px-8 lg:py-6">
        <div className="device-wrap">
          <Device
            pressed={pressed}
            onPress={onPress}
            muted={muted}
            onToggleMute={toggleMute}
            ledOn={ledOn}
            ledBlink={celebrate !== null}
            marks={marks}
          >
            <Screen ref={lcdRef} off={screen === "boot" && !ready} wipe={wipe}>
              {screen === "boot" && ready && <BootScreen onLed={() => setLedOn(true)} onDone={finishBoot} />}

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
                      You are {score.percent}% Bengaluru native, {score.badge}. {score.marked} of {TILE_COUNT} tiles
                      stamped{stampedWords}.
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
              {overlay === "help" && <Help onClose={() => setOverlay("pause")} />}
              {overlay === "confirmClear" && (
                <ConfirmClear
                  count={score.marked}
                  selected={dlgSel}
                  onSelect={setDlgSel}
                  onKeep={() => setOverlay("pause")}
                  onClear={clearCard}
                />
              )}
              {overlay === "linkInfo" && (
                <LinkInfo status={status.kind === "idle" ? "" : status.message} onCopy={copyFromDialog} />
              )}
            </Screen>
          </Device>
        </div>

        <div className="mt-4 w-full max-w-[30rem] px-2 lg:mt-0 lg:flex-1 lg:px-0">
          <h1 className="wordmark t-display-xl sr-only lg:not-sr-only">Bengaluru Bingo</h1>
          <p
            className="t-ui-s mt-3 hidden text-desk-dim lg:block"
            style={{ fontSize: 12 }}
          >
            A Ginhouse game by Ginclair
          </p>
          <p className="t-body mt-5 hidden lg:block">
            Stamp everything you&apos;ve actually done in Bengaluru. Press START to see how native you
            are, then post your card.
          </p>
          <p className="t-body text-center text-desk-dim lg:hidden">
            Tap a tile or use the buttons. START shows your score.
          </p>

          <section className="panel mt-6 hidden lg:block" aria-labelledby="manual-title">
            <div className="panel__head">
              <h2 id="manual-title" className="t-ui-l">
                Controls
              </h2>
            </div>
            <table className="w-full border-separate border-spacing-y-2 text-left">
              <tbody>
                {CONTROLS.map((row) => (
                  <tr key={row.action}>
                    <th scope="row" className="w-[45%] pr-3 align-middle font-normal">
                      <span className="flex flex-wrap gap-1">
                        {row.keys.map((k) => (
                          <span key={k} className="keycap">
                            {k}
                          </span>
                        ))}
                      </span>
                    </th>
                    <td className="t-body align-middle">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel mt-4 hidden lg:block" aria-labelledby="save-title">
            <div className="panel__head" style={{ "--strip": "var(--shell)" } as React.CSSProperties}>
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
                <li
                  key={id}
                  className="chip t-label"
                  style={{ background: `var(--cat-${id})`, padding: "4px 6px", gap: 6 }}
                >
                  <span
                    className="glyph"
                    dangerouslySetInnerHTML={{ __html: categoryGlyphSvg(id) }}
                  />
                  {CATEGORIES[id].label} {score.byCategory[id]}
                </li>
              ))}
            </ul>
          </section>

          <SiteFooter className="mt-6 text-center lg:text-left" />
        </div>
      </main>

      {screen === "share" && (
        <div className="save-stage" aria-hidden="true">
          <div ref={cardRef}>
            <Scorecard score={score} className="scorecard" />
          </div>
        </div>
      )}

      <p className="sr-only-live" role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
