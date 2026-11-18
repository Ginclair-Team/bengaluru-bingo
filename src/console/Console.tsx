"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter } from "@/components/SiteHeader";
import { isMuted, loadMuted, play, setMuted as persistMuted, unlockAudio } from "@/lib/sound";
import { ConsoleContext, type ConsoleContextValue, type KeyListener } from "./context";
import { BootScreen } from "./device/BootScreen";
import { CONTROLS, KEYMAP, type Key } from "./device/controls";
import { Device } from "./device/Device";
import { Screen, type WipePhase } from "./device/Screen";
import { Menu } from "./Menu";
import { CARTRIDGES, playable } from "./registry";
import type { ConsoleHost } from "./types";

const BOOTED_KEY = "bp:booted";
const MENU_LEDE =
  "Bengaluru Pocket is a console for small games about the city. Pick a cartridge from the shelf and press START.";
const MENU_HINT = "Tap a game, or use the D-pad and A.";

type View = "boot" | "menu" | "game";

/**
 * Bengaluru Pocket: the handheld shared by every game. It runs the boot, the
 * home menu and the screen wipe; it routes keys (hardware, keyboard) to the
 * menu or to the cartridge in play; and it prints the cartridge's legends and
 * sticker on the shell.
 */
export function Console() {
  const [view, setView] = useState<View>("boot");
  const [ready, setReady] = useState(false);
  const [cartridgeId, setCartridgeId] = useState<string | null>(null);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [wipe, setWipe] = useState<WipePhase>(null);
  const [ledOn, setLedOn] = useState(false);
  const [ledBlink, setLedBlink] = useState(false);
  const [grille, setGrille] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [pressed, setPressed] = useState<Partial<Record<Key, boolean>>>({});
  const [announcement, setAnnouncement] = useState("");
  const [side, setSide] = useState<HTMLDivElement | null>(null);

  const lcdRef = useRef<HTMLDivElement>(null);
  const listeners = useRef(new Set<KeyListener>());
  const busy = useRef(false);
  const reduced = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bootTarget = useRef<string | null>(null);
  const booting = useRef(false);
  const shiftClean = useRef(false);
  const viewRef = useRef<View>("boot");
  viewRef.current = view;

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const announce = useCallback((message: string) => {
    setAnnouncement((prev) => (prev === message ? `${message} ` : message));
  }, []);

  // ---- Start up: sound setting, boot decision, and which game to open ----
  useEffect(() => {
    setMutedState(loadMuted());
    const params = new URLSearchParams(window.location.search);
    // Old card links (?c=, ?club=, ?view=card) open Bingo directly.
    const legacy = params.has("c") || params.has("club") || params.get("view") === "card";
    const game = playable(params.get("g") ?? (legacy ? "bingo" : null))?.id ?? null;

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
      // Treat as a first visit.
    }
    setReady(true);
    if (params.get("view") === "card" || booted || mq.matches) {
      setLedOn(true);
      if (game) {
        setCartridgeId(game);
        setLastPlayed(game);
        setView("game");
      } else {
        setView("menu");
      }
    } else {
      bootTarget.current = game;
      setView("boot");
    }

    const pending = timers.current;
    return () => {
      mq.removeEventListener?.("change", onMq);
      pending.forEach(clearTimeout);
    };
  }, []);

  // Audio may only start after a gesture.
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio, { capture: true });
    return () => window.removeEventListener("pointerdown", unlockAudio, { capture: true });
  }, []);

  // ---- Screen changes: eight-blind wipe, or an instant swap ----
  const transition = useCallback(
    (change: () => void) => {
      if (busy.current) return;
      play("screen");
      if (reduced.current) {
        change();
        return;
      }
      busy.current = true;
      setWipe("close");
      later(() => {
        change();
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
    if (booting.current) return;
    booting.current = true;
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
    } catch {
      // Boots again next load; harmless.
    }
    setLedOn(true);
    const target = bootTarget.current;
    transition(() => {
      if (target) {
        setCartridgeId(target);
        setLastPlayed(target);
        setView("game");
        announce(`${CARTRIDGES.find((c) => c.id === target)?.title ?? "Game"} ready`);
      } else {
        setView("menu");
        announce("Bengaluru Pocket ready");
      }
    });
  }, [transition, announce]);

  const openGame = useCallback(
    (id: string) => {
      transition(() => {
        setLastPlayed(id);
        setCartridgeId(id);
        setView("game");
      });
    },
    [transition]
  );

  const exit = useCallback(() => {
    transition(() => {
      setGrille(0);
      setCartridgeId(null);
      setView("menu");
      announce("Back to the menu.");
    });
  }, [transition, announce]);

  // ---- Sound and light ----
  const toggleSound = useCallback(() => {
    const next = !isMuted();
    persistMuted(next);
    setMutedState(next);
    unlockAudio();
    if (!next) play("open");
    announce(next ? "Sound and haptics off" : "Sound and haptics on");
  }, [announce]);

  const flashLed = useCallback(() => {
    setLedBlink(true);
    later(() => setLedBlink(false), 1200);
  }, [later]);

  const host = useMemo<ConsoleHost>(
    () => ({ muted, toggleSound, exit, transition, announce, flashLed, setGrille }),
    [muted, toggleSound, exit, transition, announce, flashLed]
  );

  // ---- Keys: one place decides who hears them ----
  const subscribe = useCallback((listener: KeyListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const flash = useCallback((key: Key, on: boolean) => {
    setPressed((p) => ({ ...p, [key]: on }));
  }, []);

  const dispatch = useCallback(
    (key: Key) => {
      if (viewRef.current === "boot") {
        finishBoot();
        return;
      }
      if (busy.current) return;
      listeners.current.forEach((listener) => listener(key));
    },
    [finishBoot]
  );

  const skipBoot = useCallback(() => {
    if (viewRef.current === "boot") finishBoot();
  }, [finishBoot]);

  // Always the latest closures, so the key listener is registered once.
  const api = useRef({ dispatch, toggleSound, skipBoot, flash });
  api.current = { dispatch, toggleSound, skipBoot, flash };

  // Keyboard: scoped so it never eats typing or browser shortcuts.
  useEffect(() => {
    const releaseLater = (key: Key) => window.setTimeout(() => api.current.flash(key, false), 90);

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
        if (!e.repeat) api.current.toggleSound();
        return;
      }

      const key = KEYMAP[lower];
      const activator = lower === "Enter" || lower === " ";
      if (activator && t) {
        // Native activation for links and for buttons. Grid cells are the
        // exception: the console forwards them as keys.
        if (t.closest("a[href]")) return;
        const btn = t.closest("button, [role='button']");
        if (btn && !btn.closest("[data-cell]")) return;
      }
      if (!key) {
        // During boot, any key skips it.
        if (e.key.length === 1) api.current.skipBoot();
        return;
      }
      e.preventDefault();
      const direction = key === "up" || key === "down" || key === "left" || key === "right";
      if (e.repeat && !direction) return;
      api.current.flash(key, true);
      api.current.dispatch(key);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        if (shiftClean.current) {
          shiftClean.current = false;
          api.current.flash("select", true);
          api.current.dispatch("select");
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
  }, []);

  // ---- What the shell shows ----
  const cartridge = view === "game" ? CARTRIDGES.find((c) => c.id === cartridgeId) ?? null : null;
  const legends = cartridge ? cartridge.legends : { a: "PLAY", b: "" };
  const sticker = cartridge ? cartridge.sticker : "CHOOSE A GAME";
  const lede = cartridge ? cartridge.lede : MENU_LEDE;
  const hint = cartridge ? cartridge.hint : MENU_HINT;

  const context = useMemo<ConsoleContextValue>(
    () => ({ host, lcd: lcdRef, side, subscribe }),
    [host, side, subscribe]
  );

  const onPress = useCallback((key: Key) => api.current.dispatch(key), []);

  return (
    <ConsoleContext.Provider value={context}>
      <a href="#console" className="skip-link">
        Skip to the console
      </a>
      <main className="mx-auto flex w-full max-w-[1040px] flex-col items-center px-2 pb-8 pt-2 lg:min-h-[100dvh] lg:flex-row lg:justify-center lg:gap-14 lg:px-8 lg:py-6">
        <div className="device-wrap">
          <Device
            pressed={pressed}
            onPress={onPress}
            muted={muted}
            onToggleMute={toggleSound}
            ledOn={ledOn}
            ledBlink={ledBlink}
            grille={grille}
            sticker={sticker}
            legends={legends}
          >
            <Screen ref={lcdRef} off={view === "boot" && !ready} wipe={wipe}>
              {view === "boot" && ready && (
                <BootScreen onLed={() => setLedOn(true)} onDone={finishBoot} />
              )}
              {view === "menu" && (
                <div style={{ position: "absolute", inset: 0 }}>
                  <Menu
                    lastPlayed={lastPlayed}
                    muted={muted}
                    onPlay={openGame}
                    onSound={toggleSound}
                    announce={announce}
                  />
                </div>
              )}
              {view === "game" && cartridge && (
                <div style={{ position: "absolute", inset: 0 }} key={cartridge.id}>
                  <cartridge.Game />
                </div>
              )}
            </Screen>
          </Device>
        </div>

        <div className="mt-4 w-full max-w-[30rem] px-2 lg:mt-0 lg:flex-1 lg:px-0">
          <h1 className="wordmark t-display-xl sr-only lg:not-sr-only">Bengaluru Pocket</h1>
          <p className="t-ui-s mt-3 hidden text-desk-dim lg:block" style={{ fontSize: 12 }}>
            A Ginhouse console by Ginclair
          </p>
          <p className="t-body mt-5 hidden lg:block">{lede}</p>
          <p className="t-body text-center text-desk-dim lg:hidden">{hint}</p>

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

          {/* A cartridge's own desk panels (for example Bingo's save file) are portalled here. */}
          <div ref={setSide} className="hidden lg:block" />

          <SiteFooter className="mt-6 text-center lg:text-left" />
        </div>
      </main>

      <p className="sr-only-live" role="status" aria-live="polite">
        {announcement}
      </p>
    </ConsoleContext.Provider>
  );
}
