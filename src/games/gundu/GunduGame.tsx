"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useCartridge, useConsoleKeys } from "@/console/context";
import type { Key } from "@/console/device/controls";
import { ConfirmDialog, Help, PauseMenu, type MenuItem } from "@/console/device/Overlays";
import { PALETTE, spriteSvg, type Sprite } from "@/lib/pixel";
import { play } from "@/lib/sound";
import { cleanName, copyFor } from "./copy";
import {
  ACTIONS,
  AREAS,
  AREA_INFO,
  DECOR,
  FOOD_NAMES,
  HOW_TO_PLAY,
  MOOD_WORD,
  NAME_KEYS,
  NAME_MAX,
  NEED_LABELS,
  SCREEN_TITLES,
  SKY,
  SLOT_NAMES,
  SPECIES,
  SPECIES_INFO,
  TASTE_TAG,
  type Area,
  type Food,
  type FoodOrIdli,
  type Mood,
  type Species,
  type WindowId,
} from "./data";
import * as R from "./rules";
import { clearSave, loadSave, newSave, writeSave, type RainCard, type Save } from "./storage";
import {
  AUTO,
  BLOSSOM,
  BUCKET,
  BUS_L,
  BUS_R,
  CAR,
  DECOR_SPRITES,
  FOOD_SPRITES,
  ICON_SLEEP,
  ICON_VISIT,
  PET_SPRITES,
  SCOOTER,
  blossomed,
  mirror,
} from "./sprites";

type Screen =
  | "loading"
  | "intro"
  | "home"
  | "feed"
  | "bath"
  | "walkask"
  | "walk"
  | "walkresult"
  | "decor"
  | "visit"
  | "today"
  | "box"
  | "rain"
  | "rename";
type Overlay = null | "pause" | "help" | "areas" | "confirmMove" | "confirmReset";
type Dir = "up" | "down" | "left" | "right";

const isDir = (k: Key): k is Dir => k === "up" || k === "down" || k === "left" || k === "right";
const wrap = (n: number, size: number) => ((n % size) + size) % size;
const u = (n: number) => `calc(${n} * var(--u))`;
const inertProps = (on: boolean) => (on ? ({ inert: "" } as Record<string, string>) : {});
const pct = (v: number) => Math.round(v);

function clickRow(list: HTMLUListElement | null, index: number) {
  list?.querySelectorAll("[data-row]")[index]?.querySelector<HTMLElement>("button")?.click();
}

const WALK_LIMIT = 45;
const KEYS_GRID = [...R.CODE_ALPHABET, "Del", "Paste", "Clear", "Go"];
const FULL_GRILLE = 0x1ffffff;

// ---------------------------------------------------------------- drawing helpers

function Art({ grid, size, mono = false, label }: { grid: Sprite; size: number; mono?: boolean; label?: string }) {
  return (
    <span
      className="ws-art"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: u(size), height: u(size), flex: "none" }}
      dangerouslySetInnerHTML={{ __html: spriteSvg(grid, { mono }) }}
    />
  );
}

const petGrid = (species: Species, sim: R.Sim, blossom: boolean): { grid: Sprite; mood: Mood } => {
  const mood = R.moodOf(sim);
  const base = PET_SPRITES[species][mood];
  return { grid: blossom ? blossomed(base, mood, species) : base, mood };
};

function Head({ left, right }: { left: string; right?: string }) {
  return (
    <div className="lcd-header t-ui-s">
      <span>{left}</span>
      {right && <span>{right}</span>}
    </div>
  );
}

function Frame({
  left,
  right,
  info,
  children,
}: {
  left: string;
  right?: string;
  info: string;
  children: ReactNode;
}) {
  return (
    <div className="lcd-screen">
      <Head left={left} right={right} />
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>{children}</div>
      <div
        aria-live="polite"
        className="t-body-lcd"
        style={{
          flex: "none",
          height: u(54),
          minHeight: 40,
          padding: `${u(4)} ${u(8)}`,
          borderTop: "2px solid var(--lcd-ink)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {info}
      </div>
    </div>
  );
}

const sky = (win: WindowId) => PALETTE[SKY[win]];

type SceneProps = {
  win: WindowId;
  decor: [number, number, number];
  sim: R.Sim;
  blossom: boolean;
  species: Species;
  name: string;
  height: number;
  size?: number;
  bubble?: string | null;
  onBubble?: () => void;
  onPat?: () => void;
  visitor?: { area: Area; species: Species } | null;
  rain?: number | null;
  forceNight?: boolean;
  happy?: boolean;
};

function Scene(p: SceneProps) {
  const win: WindowId = p.forceNight ? "night" : p.win;
  const g = petGrid(p.species, p.happy ? { ...p.sim, asleep: false, hunger: 100, fun: 100, energy: 100, clean: 100 } : p.sim, p.blossom);
  const size = p.size ?? 64;
  const itemAt = (slot: number) => (p.decor[slot] > 0 ? DECOR[p.decor[slot] - 1] : null);
  const stars = [
    [12, 14],
    [30, 6],
    [52, 18],
    [70, 8],
    [88, 16],
  ];
  const floorY = p.height * 0.3;
  return (
    <div style={{ position: "relative", width: "100%", height: u(p.height), background: sky(win), overflow: "hidden" }}>
      {win === "night" &&
        stars.map(([x, y]) => (
          <span
            key={x}
            aria-hidden="true"
            style={{ position: "absolute", left: `${x}%`, top: u(y), width: u(3), height: u(3), background: PALETTE.W }}
          />
        ))}
      {win === "traffic" &&
        [8, 22, 38, 60, 76, 90].map((x) => (
          <span
            key={x}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${x}%`,
              bottom: u(floorY + p.height * 0.28),
              width: u(4),
              height: u(3),
              background: PALETTE.Y,
            }}
          />
        ))}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: u(floorY),
          background: PALETTE.E,
          borderTop: `${u(3)} solid ${PALETTE.K}`,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: u(floorY),
          height: u(p.height * 0.2),
          borderTop: `${u(2)} solid ${PALETTE.K}`,
          background: `repeating-linear-gradient(90deg, transparent 0 ${u(10)}, ${PALETTE.K} ${u(10)} ${u(12)})`,
        }}
      />
      {itemAt(0) && (
        <span style={{ position: "absolute", left: "calc(50% - 16 * var(--u))", top: u(6) }} aria-hidden="true">
          <Art grid={DECOR_SPRITES[itemAt(0)!.id]} size={32} />
        </span>
      )}
      {itemAt(1) && (
        <span style={{ position: "absolute", left: "6%", bottom: u(4) }} aria-hidden="true">
          <Art grid={DECOR_SPRITES[itemAt(1)!.id]} size={32} />
        </span>
      )}
      {itemAt(2) && (
        <span style={{ position: "absolute", right: "6%", bottom: u(4) }} aria-hidden="true">
          <Art grid={DECOR_SPRITES[itemAt(2)!.id]} size={32} />
        </span>
      )}
      {p.visitor && (
        <span style={{ position: "absolute", right: "10%", bottom: u(floorY + 4), textAlign: "center" }}>
          <Art grid={PET_SPRITES[p.visitor.species].idle} size={32} label={`Visitor from ${p.visitor.area}`} />
          <span className="t-label" style={{ display: "block" }}>
            From {p.visitor.area}
          </span>
        </span>
      )}
      <button
        type="button"
        onClick={p.onPat}
        aria-label={`Pat ${p.name}`}
        tabIndex={-1}
        style={{
          position: "absolute",
          left: "50%",
          bottom: u(floorY - 6),
          transform: "translateX(-50%)",
          background: "none",
          border: 0,
          padding: 0,
          cursor: "pointer",
        }}
      >
        <Art grid={g.grid} size={size} label={`${p.name}, ${MOOD_WORD[g.mood]}`} />
      </button>
      {p.bubble && (
        <button
          type="button"
          onClick={p.onBubble}
          tabIndex={-1}
          className="t-body-lcd"
          style={{
            position: "absolute",
            left: "50%",
            top: u(8),
            transform: "translateX(-50%)",
            maxWidth: "80%",
            background: PALETTE.W,
            color: PALETTE.K,
            border: `${u(2)} solid ${PALETTE.K}`,
            padding: `${u(3)} ${u(6)}`,
          }}
        >
          {p.bubble}
        </button>
      )}
      {typeof p.rain === "number" && (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 22 }, (_, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${(i * 37) % 100}%`,
                top: `${((i * 53 + (p.rain as number) * 23) % 100) - 4}%`,
                width: u(2),
                height: u(6),
                background: PALETTE.B,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: u(4) }}>
      <span className="t-label" style={{ width: u(52), textAlign: "left" }}>
        {label} {pct(value)}
      </span>
      <span style={{ flex: 1, height: u(6), background: PALETTE.C, border: `${u(1)} solid ${PALETTE.K}` }}>
        <span style={{ display: "block", height: "100%", width: `${value}%`, background: PALETTE.K }} />
      </span>
    </div>
  );
}

type CardData = {
  day: number;
  area: Area;
  species: Species;
  name: string;
  sim: R.Sim;
  decor: [number, number, number];
  win: WindowId;
  mood: Mood;
  blossom: boolean;
  title: string;
};

function Postcard({ c }: { c: CardData }) {
  const score = R.careScore(c.sim);
  return (
    <div
      style={{
        width: u(214),
        maxWidth: "94%",
        height: "calc(100% - 8px)",
        margin: "4px auto",
        background: "var(--lcd-mid, #f6e3c8)",
        border: `${u(2)} solid ${PALETTE.K}`,
        boxShadow: `${u(4)} ${u(4)} 0 ${PALETTE.K}`,
        display: "flex",
        flexDirection: "column",
        gap: u(3),
        padding: u(5),
        overflow: "hidden",
      }}
    >
      <Scene win={c.win} decor={c.decor} sim={c.sim} blossom={c.blossom} species={c.species} name={c.name} height={84} size={48} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="t-ui-l" style={{ fontSize: "max(10px, calc(11 * var(--u)))" }}>
          {MOOD_WORD[c.mood]}
        </span>
        <span className="t-label">{c.title}</span>
      </div>
      <Bar label={NEED_LABELS.hunger} value={c.sim.hunger} />
      <Bar label={NEED_LABELS.fun} value={c.sim.fun} />
      <Bar label={NEED_LABELS.energy} value={c.sim.energy} />
      <Bar label={NEED_LABELS.clean} value={c.sim.clean} />
      <p className="t-display-s" style={{ margin: 0 }}>
        {score}% looked after
      </p>
      <p className="t-label" style={{ margin: 0 }}>
        Day {c.day} · {c.area}
      </p>
    </div>
  );
}

function BigButton({
  label,
  keyLabel,
  primary,
  onClick,
  autoFocus,
}: {
  label: string;
  keyLabel?: string;
  primary?: boolean;
  onClick: () => void;
  autoFocus?: boolean;
}) {
  return (
    <button
      type="button"
      className={primary ? "lcd-btn lcd-btn--primary" : "lcd-btn"}
      data-autofocus={autoFocus ? "true" : undefined}
      onClick={onClick}
    >
      {keyLabel && (
        <span className="key t-label" aria-hidden="true">
          {keyLabel}
        </span>
      )}
      {label}
    </button>
  );
}

/** The naming keyboard: six columns, the keys in NAME_KEYS. */
function NameBoard({ sel, onSelect, onPick }: { sel: number; onSelect: (i: number) => void; onPick: (k: string) => void }) {
  return (
    <div role="group" aria-label="Name keys" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0 }}>
      {NAME_KEYS.map((k, i) => (
        <button
          key={k}
          type="button"
          className="menu-row"
          data-selected={sel === i}
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onSelect(i);
            onPick(k);
          }}
          style={{ height: u(34), minHeight: 32, justifyContent: "center", padding: 0, border: `${u(1)} solid var(--lcd-ink)` }}
        >
          <span className="t-label">{k}</span>
        </button>
      ))}
    </div>
  );
}

const Actions = ({ children }: { children: ReactNode }) => <div className="result-actions">{children}</div>;

const centred: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: u(6),
  padding: u(10),
  textAlign: "center",
};

// ---------------------------------------------------------------- the game

type WalkRun = {
  row: number;
  t: number;
  seed: number;
  win: WindowId;
  slow: boolean;
  walksBefore: number;
  hit: string;
};

type WalkResult = { stars: number; seconds: number; food: Food | null; line: string };

/** A balcony pet on city time. The player picks a cat, dog or bird and names it. */
export function GunduGame() {
  const { host, lcd } = useCartridge();

  const [screen, setScreen] = useState<Screen>("loading");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [save, setSave] = useState<Save | null>(null);
  const [now, setNow] = useState(0);
  const [info, setInfo] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [salt, setSalt] = useState(0);

  const [introStep, setIntroStep] = useState(1);
  const [petSel, setPetSel] = useState(0);
  const [nameText, setNameText] = useState("");
  const [nameSel, setNameSel] = useState(0);
  const [areaSel, setAreaSel] = useState(0);
  const [sel, setSel] = useState(0);
  const [feedSel, setFeedSel] = useState(0);
  const [bath, setBath] = useState({ mugs: 0, start: 0 });
  const [walk, setWalk] = useState<WalkRun | null>(null);
  const [walkResult, setWalkResult] = useState<WalkResult | null>(null);
  const [slot, setSlot] = useState(0);
  const [cand, setCand] = useState(0);
  const [kbSel, setKbSel] = useState(0);
  const [codeText, setCodeText] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [pauseSel, setPauseSel] = useState(0);
  const [areaListSel, setAreaListSel] = useState(0);
  const [dlgSel, setDlgSel] = useState<0 | 1>(0);
  const [moveTo, setMoveTo] = useState<Area>("Malleshwaram");
  const [rainStage, setRainStage] = useState<"sky" | "fall" | "choice">("sky");
  const [rainFrame, setRainFrame] = useState(0);
  const [echo, setEcho] = useState(false);
  const [pendingCode, setPendingCode] = useState("");

  const saveRef = useRef<Save | null>(null);
  const walkRef = useRef<WalkRun | null>(null);
  const reduced = useRef(false);
  const focusPending = useRef(false);
  const pauseListRef = useRef<HTMLUListElement>(null);
  const areaListRef = useRef<HTMLUListElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // The pet as the screens see it: the saved one, or the one being named at the intro.
  const species: Species = save?.species ?? SPECIES[petSel];
  const petName = save?.name ?? cleanName(nameText, species);
  const C = useMemo(() => copyFor(petName), [petName]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const commit = useCallback((fn: (s: Save) => Save): Save | null => {
    const cur = saveRef.current;
    if (!cur) return null;
    const next = fn(cur);
    saveRef.current = next;
    setSave(next);
    if (!writeSave(next)) setBlocked(true);
    return next;
  }, []);

  /** Bring the needs up to `t`, one whole minute at a time. */
  const advance = useCallback((s: Save, t: number): Save => {
    const minutes = Math.floor(Math.min(R.MAX_CAP_MIN, Math.max(0, (t - s.lastSeen) / 60_000)));
    if (minutes <= 0) return s;
    const r = R.simulate(s.sim, s.lastSeen, minutes, false);
    return { ...s, sim: r.sim, lastSeen: s.lastSeen + minutes * 60_000 };
  }, []);

  const withActions = (s: Save, t: number, kind: string): Save => {
    const d = R.dateKey(t);
    const list = s.actions.date === d ? s.actions.list : [];
    return { ...s, actions: { date: d, list: list.includes(kind) ? list : [...list, kind] } };
  };

  const go = useCallback(
    (next: Screen, after?: () => void) => {
      focusPending.current = true;
      host.transition(() => {
        setScreen(next);
        after?.();
      });
    },
    [host]
  );

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  // ---- Read the save after mount, never during render ----
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSalt(Math.floor(Math.random() * 16));
    const t = Date.now();
    setNow(t);
    const v = new URLSearchParams(window.location.search).get("v");
    if (v) setPendingCode(R.normalizeCode(v).slice(0, 8));
    const { save: loaded, status } = loadSave();
    if (status === "blocked") {
      setBlocked(true);
      setInfo(copyFor("").MSG.storageBlocked);
    }
    if (!loaded) {
      if (status === "corrupt") setInfo(copyFor("").MSG.saveBad);
      setScreen("intro");
      return;
    }
    const c = R.catchUp(loaded.sim, loaded.lastSeen, t, loaded.name);
    const s: Save = { ...loaded, sim: c.sim, lastSeen: t };
    saveRef.current = s;
    setSave(s);
    writeSave(s);
    const away = [R.awayLine(c, loaded.name), ...c.lines].filter(Boolean).join(" ");
    setInfo(away || null);
    const day = R.dayNumber(s.planted, t);
    if (R.shouldRain(day, t, s.rain.seen)) {
      startRain(s);
    } else {
      setScreen("home");
      if (s.rain.choice === "wet" && s.rain.echo !== R.dateKey(t)) {
        setEcho(true);
        later(() => setEcho(false), 3000);
        commit((x) => ({ ...x, rain: { ...x.rain, echo: R.dateKey(t) } }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A visit link opens the visit screen once the pet is home.
  useEffect(() => {
    if (pendingCode && screen === "home") {
      setCodeText(pendingCode);
      setKbSel(KEYS_GRID.length - 1);
      setPendingCode("");
      go("visit");
    }
  }, [pendingCode, screen, go]);

  // ---- The city clock: every 30 seconds ----
  useEffect(() => {
    if (!save) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (screen === "home" || screen === "today") commit((s) => advance(s, t));
    }, 30_000);
    return () => clearInterval(id);
  }, [!!save, screen, advance, commit]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Derived, pure ----
  const day = save ? R.dayNumber(save.planted, now) : 1;
  const win: WindowId = now ? R.windowAt(now) : "day";
  const sim = save?.sim ?? R.freshSim();
  const blossom = !!save?.rain.seen;
  const actionsToday = save && save.actions.date === R.dateKey(now) ? save.actions.list.length : 0;
  const askReady = !!save && !sim.asleep && !save.asks.includes(R.askKey(now));
  const mood = R.moodOf(sim);
  const area: Area = save?.area ?? AREAS[areaSel];
  const mask = useMemo(() => R.grilleMask(sim, actionsToday), [sim, actionsToday]);

  const ownCode = useMemo(() => {
    if (!save) return "";
    return R.encodeCode({
      species: save.species,
      area: save.area,
      mood,
      day,
      decor: save.decor,
      rainSeen: save.rain.seen,
      rainWet: save.rain.choice === "wet",
      salt,
    });
  }, [save, mood, day, salt]);

  const grilleRaining = screen === "rain" || echo;

  // The speaker grille shows the lowest need at a glance (or rains).
  useEffect(() => {
    if (!grilleRaining) {
      host.setGrille(screen === "loading" || screen === "intro" ? 0 : mask);
      return;
    }
    if (reduced.current) {
      host.setGrille(FULL_GRILLE);
      return;
    }
    let f = 0;
    const id = setInterval(() => {
      f++;
      setRainFrame(f);
      let m = 0;
      for (let c = 0; c < 5; c++) {
        const k = wrap(f - c, 7);
        for (let r = 0; r <= Math.min(k, 4); r++) if (k <= 4) m |= 1 << (r * 5 + c);
      }
      host.setGrille(m);
    }, 120);
    return () => clearInterval(id);
  }, [host, mask, grilleRaining, screen]);

  const registerOwn = useCallback(
    (code: string) => {
      commit((s) => (s.ownCodes.includes(code) ? s : { ...s, ownCodes: [...s.ownCodes, code].slice(-20) }));
    },
    [commit]
  );

  // ---------------------------------------------------------------- first rain

  function startRain(s: Save) {
    const M = copyFor(s.name).MSG;
    const seenSave: Save = { ...s, rain: { ...s.rain, seen: true } };
    saveRef.current = seenSave;
    setSave(seenSave);
    writeSave(seenSave); // saved as soon as it starts, so it only ever runs once
    setScreen("rain");
    setInfo(M.rainSmell);
    play("chime");
    if (reduced.current) {
      setRainStage("choice");
      host.announce(M.rainLive);
      return;
    }
    setRainStage("sky");
    later(() => setRainStage("fall"), 1200);
    later(() => {
      setRainStage("choice");
      host.announce(M.rainLive);
    }, 2400);
  }

  const chooseRain = (choice: "umbrella" | "wet") => {
    const t = Date.now();
    const next = commit((s) => {
      const adv = advance(s, t);
      const nsim = R.rainEffect(adv.sim, choice);
      const card: RainCard = {
        day: R.dayNumber(adv.planted, t),
        area: adv.area,
        mood: "happy",
        percent: R.careScore(nsim),
        decor: adv.decor,
        choice,
      };
      return { ...adv, sim: nsim, rain: { seen: true, choice, echo: R.dateKey(t), card } };
    });
    if (!next) return;
    setNow(t);
    setInfo(C.MSG.rainDone);
    host.announce(C.MSG.rainDone);
    play("stamp");
    go("home");
  };

  // ---------------------------------------------------------------- home actions

  const flash = (line: string, sound: "error" | "stamp" | "move" | "chime" | null = null) => {
    setInfo(line);
    if (sound) play(sound);
  };

  const pat = () => {
    if (!saveRef.current) return;
    const t = Date.now();
    const cur = advance(saveRef.current, t);
    const r = R.pat(cur.sim, cur.lastPat, t, cur.name);
    if (!r.ok) {
      flash(r.line);
      return;
    }
    commit(() => ({ ...cur, sim: r.sim, lastPat: t }));
    setNow(t);
    flash(r.line, "move");
  };

  const answer = () => {
    if (!saveRef.current) return;
    const t = Date.now();
    const cur = advance(saveRef.current, t);
    if (cur.sim.asleep) {
      flash(C.MSG.noAnswer, "error");
      return;
    }
    const r = R.answerAsk(cur.sim, cur.area, cur.asks, t, cur.name);
    if (!r.ok) {
      flash(r.line, "error");
      return;
    }
    commit(() => withActions({ ...cur, sim: r.sim, asks: r.asks.slice(-8) }, t, "ask"));
    setNow(t);
    flash(r.line, "chime");
    host.announce(r.line);
  };

  const feedItem = (index: number) => {
    const cur0 = saveRef.current;
    if (!cur0) return;
    const t = Date.now();
    const cur = advance(cur0, t);
    const food: FoodOrIdli = index === 0 ? "idli" : cur.pantry[index - 1];
    if (!food) return;
    const r = R.feed(cur.sim, food, cur.area, cur.name);
    if (!r.ok) {
      flash(r.line, "error");
      return;
    }
    const pantry = r.usedItem ? R.removeFood(cur.pantry, index - 1) : cur.pantry;
    commit(() => withActions({ ...cur, sim: r.sim, pantry }, t, "feed"));
    setNow(t);
    setFeedSel(0);
    host.announce(`${cur.name} fed. Belly ${pct(r.sim.hunger)}.`);
    play("stamp");
    go("home", () => setInfo(r.line));
  };

  const pour = () => {
    const cur0 = saveRef.current;
    if (!cur0) return;
    const t = Date.now();
    const cur = bath.mugs === 0 ? advance(cur0, t) : cur0;
    const start = bath.mugs === 0 ? cur.sim.clean : bath.start;
    const mug = bath.mugs + 1;
    const nsim = R.pourMug(cur.sim, start, mug);
    let next = { ...cur, sim: nsim };
    if (mug === 3) next = withActions(next, t, "bath");
    commit(() => next);
    setNow(t);
    play("stamp");
    if (mug >= 3) {
      host.announce("Bath done. Clean 100.");
      go("home", () => setInfo("Squeaky clean."));
    } else {
      setBath({ mugs: mug, start });
      setInfo(`Mug ${mug} of 3. Clean ${pct(nsim.clean)}.`);
    }
  };

  const stopBath = () => {
    if (bath.mugs > 0) commit((s) => withActions(s, Date.now(), "bath"));
    go("home", () => setInfo(bath.mugs > 0 ? `Stopped early. Clean ${pct(sim.clean)}.` : null));
  };

  const startWalk = () => {
    const cur0 = saveRef.current;
    if (!cur0) return;
    const t = Date.now();
    const cur = advance(cur0, t);
    const d = R.dateKey(t);
    const before = cur.walks.date === d ? cur.walks.count : 0;
    const run: WalkRun = {
      row: 0,
      t: 0,
      seed: R.walkSeed(d, before),
      win: R.windowAt(t),
      slow: cur.slow,
      walksBefore: before,
      hit: "",
    };
    walkRef.current = run;
    commit(() => cur);
    setNow(t);
    go("walk", () => {
      setWalk(run);
      setInfo("Hop forward with A or Up. Reach the darshini.");
    });
  };

  const finishWalk = (stars: number, seconds: number) => {
    const run = walkRef.current;
    const cur0 = saveRef.current;
    if (!run || !cur0) return;
    walkRef.current = null;
    const t = Date.now();
    const cur = advance(cur0, t);
    const r = R.walkReward(cur.sim, stars, run.walksBefore, cur.area, cur.pantry, cur.name);
    const d = R.dateKey(t);
    commit(() =>
      withActions(
        {
          ...cur,
          sim: r.sim,
          pantry: r.pantry,
          walks: { date: d, count: run.walksBefore + 1 },
          totalWalks: cur.totalWalks + 1,
          has3Star: cur.has3Star || stars === 3,
        },
        t,
        "walk"
      )
    );
    setNow(t);
    const starText = "★".repeat(stars) + "☆".repeat(3 - stars);
    let line: string;
    if (stars === 0) line = r.foodLine;
    else if (r.food) line = `${starText} Across in ${seconds.toFixed(1)}s. Got a ${FOOD_NAMES[r.food].toLowerCase()}.`;
    else line = `${starText} Across in ${seconds.toFixed(1)}s. Fun only this time.`;
    setWalkResult({ stars, seconds, food: r.food, line });
    host.announce(stars === 0 ? "Walk timed out." : `Walk done, ${stars} star${stars === 1 ? "" : "s"}.`);
    play(stars === 0 ? "error" : "bingo");
    go("walkresult");
  };

  // The junction clock: 50ms steps, paused by any overlay.
  useEffect(() => {
    if (screen !== "walk" || overlay) return;
    const id = setInterval(() => {
      const w = walkRef.current;
      if (!w) return;
      w.t += 0.05;
      if (w.t >= WALK_LIMIT) {
        finishWalk(0, WALK_LIMIT);
        return;
      }
      if (R.isLaneRow(w.row) && R.hitsPet(R.vehiclesAt(w.seed, R.laneForRow(w.row), w.t, w.win, w.slow))) {
        const wasPast = w.row > 3;
        w.row = R.rowAfterHit(w.row);
        w.hit = wasPast ? C.MSG.honk : C.MSG.honkKerb;
        play("error");
        setInfo(w.hit);
      }
      setWalk({ ...w });
    }, 50);
    return () => clearInterval(id);
  }, [screen, overlay]); // eslint-disable-line react-hooks/exhaustive-deps

  const hop = (dir: 1 | -1) => {
    const w = walkRef.current;
    if (!w) return;
    w.row = Math.min(6, Math.max(0, w.row + dir));
    w.hit = "";
    play("move");
    if (w.row >= 6) {
      finishWalk(R.starsFor(w.t), w.t);
      return;
    }
    setWalk({ ...w });
  };

  const callOffWalk = () => {
    walkRef.current = null;
    go("home", () => setInfo(C.MSG.walkOff));
  };

  const doAction = (index: number) => {
    const cur0 = saveRef.current;
    if (!cur0) return;
    const t = Date.now();
    const cur = advance(cur0, t);
    const id = ACTIONS[index].id;
    setTouched(true);
    if (cur.sim.asleep && (id === "feed" || id === "bath" || id === "walk")) {
      flash(C.MSG.asleepShh, "error");
      return;
    }
    if (id === "feed") {
      setFeedSel(0);
      go("feed", () => setInfo(cur.pantry.length === 0 ? C.MSG.pantryEmpty : null));
    } else if (id === "bath") {
      const g = R.canBathe(cur.sim);
      if (!g.ok) flash(g.line, "error");
      else {
        setBath({ mugs: 0, start: cur.sim.clean });
        go("bath", () => setInfo(null));
      }
    } else if (id === "walk") {
      const g = R.walkGate(cur.sim, cur.pantry, t, cur.name);
      if (g.state === "blocked") flash(g.line, "error");
      else if (g.state === "pantry-full") go("walkask", () => setInfo(g.line));
      else startWalk();
    } else if (id === "sleep") {
      if (cur.sim.asleep) {
        const r = R.wakeUp(cur.sim, cur.name);
        commit(() => ({ ...cur, sim: r.sim }));
        flash(r.line, "move");
      } else {
        const r = R.putToSleep(cur.sim, t, cur.name);
        if (!r.ok) flash(r.line, "error");
        else {
          commit(() => ({ ...cur, sim: r.sim }));
          flash(r.line, "move");
        }
      }
      setNow(t);
    } else if (id === "decor") {
      setSlot(0);
      setCand(0);
      go("decor", () => setInfo(day === 1 ? C.MSG.oneItem : null));
    } else {
      registerOwn(ownCode);
      setKbSel(0);
      setCodeText("");
      go("visit", () => setInfo(null));
    }
  };

  // ---------------------------------------------------------------- decor

  const slotCands = useMemo(() => [null, ...R.decorForSlot(slot)], [slot]);
  const unlocked = useMemo(
    () =>
      save
        ? R.unlockedDecor({ day, totalWalks: save.totalWalks, has3Star: save.has3Star, rainSeen: save.rain.seen })
        : [],
    [save, day]
  );

  const placeDecor = () => {
    const item = slotCands[cand];
    if (item && !unlocked.includes(item.id)) {
      flash(item.locked, "error");
      return;
    }
    const value = item ? DECOR.findIndex((d) => d.id === item.id) + 1 : 0;
    commit((s) => {
      const d: [number, number, number] = [...s.decor];
      d[slot] = value;
      return { ...s, decor: d };
    });
    flash(item ? R.placeLine(item.name, slot) : `${SLOT_NAMES[slot]} cleared.`, "stamp");
  };

  // ---------------------------------------------------------------- visits

  const typeKey = (k: string) => {
    if (k === "Del") setCodeText((c) => c.slice(0, -1));
    else if (k === "Clear") setCodeText("");
    else if (k === "Paste") {
      void (async () => {
        try {
          const text = await navigator.clipboard.readText();
          setCodeText(R.normalizeCode(text).slice(0, 8));
        } catch {
          setInfo("Couldn't read the clipboard. Type the letters instead.");
        }
      })();
    } else if (k === "Go") submitCode();
    else setCodeText((c) => (c.length < 8 ? c + k : c));
  };

  const submitCode = () => {
    const cur0 = saveRef.current;
    if (!cur0) return;
    const t = Date.now();
    const cur = advance(cur0, t);
    const own = [...cur.ownCodes, ownCode];
    const chk = R.checkVisit(codeText, own, cur.visits, t);
    if (!chk.ok) {
      flash(chk.line, "error");
      return;
    }
    const gift = R.visitGift(chk.fields.area, cur.area, cur.pantry, cur.name);
    commit(() => ({
      ...cur,
      sim: R.applyVisit(cur.sim),
      pantry: gift.pantry,
      visits: R.logVisit(cur.visits, chk.code, t),
      visitor: { area: chk.fields.area, species: chk.fields.species, code: chk.code, date: R.dateKey(t) },
      box: R.pushBox(cur.box, chk.code),
    }));
    setNow(t);
    setCodeText("");
    const line = `A ${SPECIES_INFO[chk.fields.species].noun} from ${chk.fields.area} dropped by. ${gift.line}`;
    host.announce(line);
    play("chime");
    go("home", () => setInfo(line));
  };

  // ---------------------------------------------------------------- today's card and sharing

  const cards: CardData[] = useMemo(() => {
    if (!save) return [];
    const list: CardData[] = [
      {
        day,
        area: save.area,
        species: save.species,
        name: save.name,
        sim,
        decor: save.decor,
        win,
        mood,
        blossom,
        title: win === "kaapi" ? "Kaapi time" : win === "day" ? "Daytime" : win === "traffic" ? "Traffic time" : "Night",
      },
    ];
    const rc = save.rain.card;
    if (rc) {
      list.push({
        day: rc.day,
        area: rc.area,
        species: save.species,
        name: save.name,
        sim: { hunger: rc.percent, fun: rc.percent, energy: rc.percent, clean: rc.percent, asleep: false, story: false },
        decor: rc.decor,
        win: "night",
        mood: rc.mood,
        blossom: true,
        title: "First rain",
      });
    }
    return list;
  }, [save, day, sim, win, mood, blossom]);

  const shareCard = async () => {
    const c = cards[Math.min(cardIndex, cards.length - 1)];
    const cur = saveRef.current;
    if (!c || !cur) return;
    const code =
      cardIndex === 0
        ? ownCode
        : R.encodeCode({
            species: cur.species,
            area: c.area,
            mood: c.mood,
            day: c.day,
            decor: c.decor,
            rainSeen: true,
            rainWet: cur.rain.choice === "wet",
            salt,
          });
    registerOwn(code);
    const text = R.shareText(c.day, c.area, R.careScore(c.sim), R.formatCode(code), cur.name, cur.species);
    const url = `${window.location.origin}/?g=gundu&v=${code}`;
    commit((s) => withActions(s, Date.now(), "share"));
    setSalt(Math.floor(Math.random() * 16));
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text, url });
        flash("Card shared.", "chime");
        return;
      }
      throw new Error("no share");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        flash(C.MSG.copied, "chime");
        host.announce(C.MSG.copied);
      } catch {
        flash(`Couldn't open sharing. Code copied: ${R.formatCode(code)}.`, "error");
      }
    }
  };

  // ---------------------------------------------------------------- naming (intro and rename)

  const pickSpecies = (i: number) => {
    setPetSel(i);
    setNameText(SPECIES_INFO[SPECIES[i]].fallback);
    setNameSel(0);
    setIntroStep(3);
    play("stamp");
  };

  const confirmIntroName = () => {
    setNameText(cleanName(nameText, species));
    setIntroStep(4);
    play("stamp");
  };

  const finishRename = () => {
    const cur = saveRef.current;
    if (!cur) return;
    const name = cleanName(nameText, cur.species);
    commit((s) => ({ ...s, name }));
    go("home", () => setInfo(copyFor(name).MSG.renamed));
  };

  const startRename = () => {
    setNameText(save?.name ?? "");
    setNameSel(0);
    setOverlay(null);
    go("rename", () => setInfo(null));
  };

  /** Type a key on the naming board. `onGo` keeps the name (Go or CONTINUE). */
  const typeNameKey = (k: string, onGo: () => void) => {
    if (k === "Del") setNameText((t) => t.slice(0, -1));
    else if (k === "Clear") setNameText("");
    else if (k === "Go") onGo();
    else if (k === "Space") setNameText((t) => (t && !t.endsWith(" ") && t.length < NAME_MAX ? `${t} ` : t));
    else
      setNameText((t) =>
        t.length < NAME_MAX ? t + (t === "" || t.endsWith(" ") ? k.toUpperCase() : k.toLowerCase()) : t
      );
  };

  /** D-pad moves over the board, A types, B deletes (or backs out when empty), CONTINUE keeps the name. */
  function pressName(key: Key, onGo: () => void, onBack: () => void) {
    if (isDir(key)) {
      const step = key === "right" ? 1 : key === "left" ? -1 : key === "down" ? 6 : -6;
      setNameSel((s) => wrap(s + step, NAME_KEYS.length));
      play("move");
    } else if (key === "a") typeNameKey(NAME_KEYS[nameSel], onGo);
    else if (key === "b") {
      if (nameText.length === 0) onBack();
      else setNameText((t) => t.slice(0, -1));
    } else if (key === "continue") onGo();
  }

  // ---------------------------------------------------------------- overlays and the pause menu

  const openOverlay = (o: Exclude<Overlay, null>) => {
    focusPending.current = true;
    if (o === "pause") setPauseSel(0);
    if (o === "areas") setAreaListSel(Math.max(0, AREAS.indexOf(saveRef.current?.area ?? "Malleshwaram")));
    if (o === "confirmMove" || o === "confirmReset") setDlgSel(0);
    setOverlay(o);
    play("open");
  };

  const closeOverlay = () => {
    focusPending.current = true;
    setOverlay(null);
    play("close");
  };

  const toPause = () => {
    focusPending.current = true;
    setOverlay("pause");
    play("close");
  };

  // Before the first save exists (the intro), only the items that make sense are offered.
  const pauseItems: MenuItem[] = save
    ? [
        { id: "help", label: "How to play" },
        { id: "box", label: SCREEN_TITLES.box },
        { id: "sound", label: `Sound: ${host.muted ? "off" : "on"}` },
        { id: "traffic", label: `Traffic: ${save.slow ? "slow" : "normal"}` },
        { id: "rename", label: "Rename pet" },
        { id: "move", label: "Move house" },
        { id: "reset", label: "Start over" },
        { id: "resume", label: "Resume" },
      ]
    : [
        { id: "help", label: "How to play" },
        { id: "sound", label: `Sound: ${host.muted ? "off" : "on"}` },
        { id: "quit", label: "Quit to menu" },
        { id: "resume", label: "Resume" },
      ];

  const activatePause = (i: number) => {
    const id = pauseItems[i].id;
    if (id === "help") openOverlay("help");
    else if (id === "box") {
      setOverlay(null);
      go("box");
    } else if (id === "sound") host.toggleSound();
    else if (id === "traffic") commit((s) => ({ ...s, slow: !s.slow }));
    else if (id === "rename") startRename();
    else if (id === "move") openOverlay("areas");
    else if (id === "reset") openOverlay("confirmReset");
    else if (id === "quit") host.exit();
    else closeOverlay();
  };

  const areaItems: MenuItem[] = AREAS.map((a) => ({
    id: a,
    label: a === save?.area ? `${a} (here)` : a,
  }));

  const doMove = () => {
    commit((s) => ({ ...s, area: moveTo }));
    setOverlay(null);
    play("stamp");
    flash(`${C.name} moved to ${moveTo}. ${AREA_INFO[moveTo].line}`);
    focusPending.current = true;
  };

  const doReset = () => {
    clearSave();
    saveRef.current = null;
    setSave(null);
    setOverlay(null);
    setIntroStep(1);
    setPetSel(0);
    setNameText("");
    setNameSel(0);
    setAreaSel(0);
    setInfo(null);
    host.announce("A new flower is falling.");
    go("intro");
  };

  // ---------------------------------------------------------------- keys

  const homeBarOrder = ACTIONS.map((_, i) => i);

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
      if (!isDir(key)) toPause();
      return;
    }
    if (overlay === "areas") {
      if (key === "up" || key === "down") {
        focusPending.current = true;
        setAreaListSel((s) => wrap(s + (key === "down" ? 1 : -1), AREAS.length));
        play("move");
      } else if (key === "a" || key === "continue") clickRow(areaListRef.current, areaListSel);
      else if (key === "b" || key === "menu") toPause();
      return;
    }
    if (overlay === "confirmMove" || overlay === "confirmReset") {
      if (isDir(key)) {
        focusPending.current = true;
        setDlgSel((s) => (s === 0 ? 1 : 0));
        play("move");
      } else if (key === "a" || key === "continue") {
        if (dlgSel === 0) {
          if (overlay === "confirmMove") openOverlay("areas");
          else toPause();
        } else if (overlay === "confirmMove") doMove();
        else doReset();
      } else if (overlay === "confirmMove") openOverlay("areas");
      else toPause();
      return;
    }

    if (screen === "loading" || screen === "rain") {
      if (screen === "rain" && rainStage === "choice") {
        if (key === "menu") openOverlay("pause");
        else if (key === "a" || key === "continue") chooseRain("umbrella");
        else if (key === "b") chooseRain("wet");
      }
      return;
    }
    if (screen === "intro") {
      if (key === "menu") openOverlay("pause");
      else pressIntro(key);
      return;
    }

    if (key === "menu") {
      if (screen === "walk" && !walkRef.current) return;
      openOverlay("pause");
      return;
    }

    switch (screen) {
      case "home":
        return pressHome(key);
      case "feed": {
        const count = 1 + (save?.pantry.length ?? 0);
        if (key === "up" || key === "down") {
          focusPending.current = true;
          setFeedSel((s) => wrap(s + (key === "down" ? 1 : -1), count));
          play("move");
        } else if (key === "a") feedItem(feedSel);
        else if (key === "b") go("home", () => setInfo(null));
        else if (key === "continue") go("today");
        return;
      }
      case "bath":
        if (key === "a") pour();
        else if (key === "b") stopBath();
        return;
      case "walkask":
        if (key === "a") startWalk();
        else if (key === "b") go("home", () => setInfo(null));
        return;
      case "walk":
        if (key === "a" || key === "up") hop(1);
        else if (key === "down") hop(-1);
        else if (key === "b") callOffWalk();
        return;
      case "walkresult":
        if (key === "a" && walkResult?.food) {
          const idx = (saveRef.current?.pantry.lastIndexOf(walkResult.food) ?? -1) + 1;
          setFeedSel(Math.max(1, idx));
          go("feed", () => setInfo(null));
        } else if (key === "b" || (key === "a" && !walkResult?.food) || key === "continue") go("home", () => setInfo(null));
        return;
      case "decor":
        if (key === "left" || key === "right") {
          setSlot((s) => wrap(s + (key === "right" ? 1 : -1), 3));
          setCand(0);
          play("move");
        } else if (key === "up" || key === "down") {
          setCand((c) => wrap(c + (key === "down" ? 1 : -1), slotCands.length));
          play("move");
        } else if (key === "a") placeDecor();
        else if (key === "b") go("home", () => setInfo(null));
        return;
      case "visit":
        if (isDir(key)) {
          focusPending.current = true;
          setKbSel((s) =>
            key === "left" ? wrap(s - 1, 36) : key === "right" ? wrap(s + 1, 36) : wrap(s + (key === "down" ? 6 : -6), 36)
          );
          play("move");
        } else if (key === "a") typeKey(KEYS_GRID[kbSel]);
        else if (key === "b") {
          if (codeText.length === 0) go("home", () => setInfo(null));
          else setCodeText((c) => c.slice(0, -1));
        } else if (key === "continue") submitCode();
        return;
      case "today":
        if (key === "left" || key === "right") {
          if (cards.length > 1) {
            setCardIndex((i) => wrap(i + (key === "right" ? 1 : -1), cards.length));
            play("move");
          }
        } else if (key === "a" || key === "continue") void shareCard();
        else if (key === "b") go("home", () => setInfo(null));
        return;
      case "box":
        if (key === "a" || key === "b" || key === "continue") go("home", () => setInfo(null));
        return;
      case "rename":
        return pressName(key, finishRename, () => go("home", () => setInfo(null)));
    }
  };

  function pressIntro(key: Key) {
    if (introStep === 1) {
      if (key === "a") setIntroStep(2);
      else if (key === "b") host.exit();
      play(key === "a" ? "move" : "close");
    } else if (introStep === 2) {
      if (key === "up" || key === "down") {
        focusPending.current = true;
        setPetSel((s) => wrap(s + (key === "down" ? 1 : -1), SPECIES.length));
        play("move");
      } else if (key === "a" || key === "continue") pickSpecies(petSel);
      else if (key === "b") setIntroStep(1);
    } else if (introStep === 3) {
      pressName(key, confirmIntroName, () => setIntroStep(2));
    } else if (introStep === 4) {
      if (key === "up" || key === "down") {
        focusPending.current = true;
        setAreaSel((s) => wrap(s + (key === "down" ? 1 : -1), AREAS.length));
        play("move");
      } else if (key === "a") {
        setIntroStep(5);
        play("stamp");
      } else if (key === "b") setIntroStep(3);
    } else if (key === "a" || key === "continue") {
      const t = Date.now();
      const s = newSave(AREAS[areaSel], SPECIES[petSel], nameText, t, R.dateKey(t));
      saveRef.current = s;
      setSave(s);
      if (!writeSave(s)) setBlocked(true);
      setNow(t);
      setInfo(null);
      setSel(0);
      play("chime");
      go("home");
    } else if (key === "b") setIntroStep(4);
  }

  function pressHome(key: Key) {
    setTouched(true);
    if (isDir(key) && (key === "left" || key === "right")) {
      focusPending.current = true;
      setSel((s) => wrap(s + (key === "right" ? 1 : -1), homeBarOrder.length));
      setInfo(null);
      play("move");
    } else if (key === "up") answer();
    else if (key === "down") pat();
    else if (key === "a") doAction(sel);
    else if (key === "b") flash(C.MSG.homeB, "error");
    else if (key === "continue") {
      setCardIndex(0);
      registerOwn(ownCode);
      go("today");
    }
  }

  useConsoleKeys(press);

  // ---- Focus follows the selected row or the primary button, inside the LCD ----
  const focusKey = `${screen}|${overlay}|${sel}|${feedSel}|${kbSel}|${introStep}|${petSel}|${nameSel}|${areaSel}|${pauseSel}|${areaListSel}|${dlgSel}|${rainStage}`;
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    const root = lcd.current;
    if (!root) return;
    const scope = overlay ? ".overlay " : "";
    root.querySelector<HTMLElement>(`${scope}[data-autofocus="true"]`)?.focus({ preventScroll: true });
  }, [focusKey, lcd]);

  // ---------------------------------------------------------------- render

  // What A and B do on the screen showing now.
  let legendA = "";
  let legendB = "";
  if (overlay === "pause" || overlay === "areas" || overlay === "confirmMove" || overlay === "confirmReset") {
    legendA = "PICK";
    legendB = "BACK";
  } else if (overlay === "help") {
    legendB = "BACK";
  } else if (screen === "rain") {
    if (rainStage === "choice") {
      legendA = "UMBRELLA";
      legendB = "GET WET";
    }
  } else if (screen === "intro") {
    if (introStep === 1) {
      legendA = "LOOK";
      legendB = "QUIT";
    } else if (introStep === 2) {
      legendA = "PICK";
      legendB = "BACK";
    } else if (introStep === 3) {
      legendA = "TYPE";
      legendB = nameText.length > 0 ? "DEL" : "BACK";
    } else if (introStep === 4) {
      legendA = "PICK";
      legendB = "BACK";
    } else if (introStep === 5) {
      legendA = "HELLO";
      legendB = "BACK";
    }
  } else if (screen === "home") {
    const homeId = ACTIONS[sel].id;
    legendA =
      homeId === "feed"
        ? "FEED"
        : homeId === "bath"
          ? "BATH"
          : homeId === "walk"
            ? "WALK"
            : homeId === "sleep"
              ? sim.asleep
                ? "WAKE"
                : "SLEEP"
              : homeId === "decor"
                ? "DECOR"
                : "VISIT";
  } else if (screen === "feed") {
    legendA = "FEED";
    legendB = "BACK";
  } else if (screen === "bath") {
    legendA = "POUR";
    legendB = bath.mugs > 0 ? "DONE" : "BACK";
  } else if (screen === "walkask") {
    legendA = "WALK";
    legendB = "BACK";
  } else if (screen === "walk") {
    legendA = "HOP";
    legendB = "CALL OFF";
  } else if (screen === "walkresult") {
    legendA = walkResult?.food ? "FEED" : "";
    legendB = "HOME";
  } else if (screen === "decor") {
    legendA = "PLACE";
    legendB = "BACK";
  } else if (screen === "visit") {
    legendA = "TYPE";
    legendB = codeText.length > 0 ? "DEL" : "BACK";
  } else if (screen === "rename") {
    legendA = "TYPE";
    legendB = nameText.length > 0 ? "DEL" : "BACK";
  } else if (screen === "today") {
    legendA = "SHARE";
    legendB = "BACK";
  } else if (screen === "box") {
    legendB = "HOME";
  }
  useEffect(() => {
    host.setLegends({ a: legendA, b: legendB });
  }, [host, legendA, legendB]);

  const clock = now ? R.formatClock(now) : "";
  const statusText = save ? R.statusLine(sim, C.name) : "";
  const homeInfo = info ?? (!touched ? C.MSG.beforeInput : statusText);

  const bubble = askReady && save ? R.askText(now) : null;

  const renderHome = () => {
    if (!save) return null;
    const asleep = sim.asleep;
    return (
      <Frame left={`Day ${day}`} right={clock} info={homeInfo}>
        <Scene
          win={win}
          decor={save.decor}
          sim={sim}
          blossom={blossom}
          species={save.species}
          name={save.name}
          height={240}
          bubble={bubble}
          onBubble={answer}
          onPat={pat}
          visitor={R.visitorPresent(save.visitor, now) ? save.visitor : null}
        />
        <div role="toolbar" aria-label="Actions" style={{ display: "flex", height: u(48), minHeight: 44 }}>
          {ACTIONS.map((a, i) => {
            const disabled =
              (asleep && (a.id === "feed" || a.id === "bath" || a.id === "walk")) || (a.id === "walk" && win === "night");
            const label = a.id === "sleep" && asleep ? "Wake" : a.label;
            const icon: Sprite =
              a.id === "feed"
                ? FOOD_SPRITES.idli
                : a.id === "bath"
                  ? BUCKET
                  : a.id === "walk"
                    ? SCOOTER
                    : a.id === "sleep"
                      ? ICON_SLEEP
                      : a.id === "decor"
                        ? DECOR_SPRITES.tulsi
                        : ICON_VISIT;
            return (
              <button
                key={a.id}
                type="button"
                className="menu-row"
                data-selected={sel === i}
                tabIndex={-1}
                aria-disabled={disabled || undefined}
                aria-label={a.id === "sleep" && asleep ? "Wake up" : a.aria}
                onFocus={() => setSel(i)}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setSel(i);
                  doAction(i);
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: u(2),
                  padding: 0,
                  color: disabled && sel !== i ? "var(--lcd-dim)" : undefined,
                }}
              >
                <Art grid={icon} size={24} mono />
                <span className="t-label">{label}</span>
              </button>
            );
          })}
        </div>
      </Frame>
    );
  };

  const renderFeed = () => {
    if (!save) return null;
    const items: { food: FoodOrIdli }[] = [{ food: "idli" }, ...save.pantry.map((food) => ({ food }))];
    return (
      <Frame left={SCREEN_TITLES.feed} right={`Belly ${pct(sim.hunger)}`} info={info ?? `Belly ${pct(sim.hunger)}. Pick a plate, press A.`}>
        <ul className="menu" aria-label="Food" style={{ padding: `${u(6)} ${u(6)}` }}>
          {items.map((it, i) => (
            <li key={`${it.food}-${i}`} data-row>
              <button
                type="button"
                className="menu-row"
                data-selected={feedSel === i}
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  feedItem(i);
                }}
                style={{ paddingLeft: u(18) }}
              >
                <span className="caret" aria-hidden="true">
                  {">"}
                </span>
                <Art grid={FOOD_SPRITES[it.food]} size={24} />
                <span>{FOOD_NAMES[it.food]}</span>
                {it.food !== "idli" && (
                  <span className="sub t-label">{TASTE_TAG[R.tasteOf(save.area, it.food)]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Frame>
    );
  };

  const renderBath = () => (
    <Frame left={SCREEN_TITLES.bath} info={info ?? C.MSG.bathTitle}>
      <div style={centred}>
        <button
          type="button"
          onClick={pour}
          data-autofocus="true"
          aria-label="Pour one mug"
          style={{ background: "none", border: 0, padding: 0, position: "relative" }}
        >
          <Art grid={BUCKET} size={64} />
          <span style={{ position: "absolute", left: "50%", top: u(-34), transform: "translateX(-50%)" }}>
            <Art grid={PET_SPRITES[species][mood]} size={40} />
          </span>
        </button>
        <p className="t-ui-l" style={{ margin: 0 }}>
          {C.MSG.bathTitle}
        </p>
        <p className="t-label" style={{ margin: 0 }}>
          {"●".repeat(bath.mugs)}
          {"○".repeat(3 - bath.mugs)} · Clean {pct(sim.clean)}
        </p>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <Actions>
          <BigButton label="Pour" keyLabel="A" primary onClick={pour} />
          <BigButton label={bath.mugs > 0 ? "Done" : "Back"} keyLabel="B" onClick={stopBath} />
        </Actions>
      </div>
    </Frame>
  );

  const renderWalkAsk = () => (
    <Frame left={SCREEN_TITLES.walk} info={info ?? C.MSG.pantryFull}>
      <div style={centred}>
        <Art grid={SCOOTER} size={48} />
        <p className="t-body-lcd" style={{ margin: 0 }}>
          {C.MSG.pantryFull}
        </p>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <Actions>
          <BigButton label="Walk anyway" keyLabel="A" primary autoFocus onClick={startWalk} />
          <BigButton label="Back" keyLabel="B" onClick={() => go("home", () => setInfo(null))} />
        </Actions>
      </div>
    </Frame>
  );

  const renderWalk = () => {
    const w = walk;
    if (!w) return null;
    const rows = [
      { h: 72, name: "darshini" },
      { h: 40, name: "L4" },
      { h: 40, name: "L3" },
      { h: 24, name: "median" },
      { h: 40, name: "L2" },
      { h: 40, name: "L1" },
      { h: 36, name: "kerb" },
    ];
    // Bottom offsets of rows 0 (kerb) to 6 (darshini).
    const bottoms = [0, 36, 76, 116, 140, 180, 220];
    const heights = [36, 40, 40, 24, 40, 40, 72];
    const remaining = Math.max(0, Math.ceil(WALK_LIMIT - w.t));
    const lanes = [0, 1, 2, 3];
    const laneRow = [1, 2, 4, 5];
    return (
      <Frame
        left={SCREEN_TITLES.walk}
        right={`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
        info={info ?? "Hop forward with A or Up."}
      >
        <div
          onClick={() => hop(1)}
          style={{ position: "absolute", inset: 0, overflow: "hidden", background: PALETTE.C }}
          aria-label="Junction. Tap to hop forward."
        >
          {rows.map((r, i) => {
            const rowIndex = 6 - i;
            return (
              <div
                key={r.name}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: u(bottoms[rowIndex]),
                  height: u(heights[rowIndex]),
                  background: r.name === "darshini" ? PALETTE.Y : r.name === "median" || r.name === "kerb" ? PALETTE.G : PALETTE.H,
                  borderTop: `${u(1)} solid ${PALETTE.K}`,
                }}
              />
            );
          })}
          <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: u(236) }}>
            <Art grid={FOOD_SPRITES.idli} size={32} label="Darshini" />
          </span>
          {lanes.map((l) =>
            R.vehiclesAt(w.seed, l, w.t, w.win, w.slow).map((v, vi) => {
              const lane = R.LANES[l];
              if (v.x > R.WORLD_W || v.x + v.len < 0) return null;
              const grid = (g: Sprite) => (lane.dir === -1 ? mirror(g) : g);
              return (
                <span
                  key={`${l}-${vi}`}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: `${(v.x / R.WORLD_W) * 100}%`,
                    bottom: u(bottoms[laneRow[l]] + 4),
                    display: "flex",
                  }}
                >
                  {lane.sprite === "bus" ? (
                    <>
                      <Art grid={BUS_L} size={32} />
                      <Art grid={BUS_R} size={32} />
                    </>
                  ) : (
                    <Art grid={grid(lane.sprite === "scooter" ? SCOOTER : lane.sprite === "auto" ? AUTO : CAR)} size={32} />
                  )}
                </span>
              );
            })
          )}
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: u(bottoms[w.row] + (w.row === 3 ? -2 : 2)),
            }}
          >
            <Art grid={petGrid(species, sim, blossom).grid} size={32} label={C.name} />
          </span>
        </div>
      </Frame>
    );
  };

  const renderWalkResult = () => (
    <Frame left={SCREEN_TITLES.walk} info={walkResult?.line ?? ""}>
      <div style={centred}>
        {walkResult?.food && <Art grid={FOOD_SPRITES[walkResult.food]} size={48} label={FOOD_NAMES[walkResult.food]} />}
        <p className="t-display-s" style={{ margin: 0 }}>
          {walkResult?.line}
        </p>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <Actions>
          {walkResult?.food ? (
            <>
              <BigButton label="Feed now" keyLabel="A" primary autoFocus onClick={() => press("a")} />
              <BigButton label="Home" keyLabel="B" onClick={() => press("b")} />
            </>
          ) : (
            <BigButton label="Home" keyLabel="B" primary autoFocus onClick={() => press("b")} />
          )}
        </Actions>
      </div>
    </Frame>
  );

  const renderDecor = () => {
    if (!save) return null;
    const item = slotCands[cand];
    const isLocked = !!item && !unlocked.includes(item.id);
    const lockedStyle: CSSProperties = isLocked ? { filter: "brightness(0)" } : {};
    return (
      <Frame left={SCREEN_TITLES.decor} info={info ?? (isLocked ? item!.locked : `${SLOT_NAMES[slot]}: ${item ? item.name : "Empty"}. A places it.`)}>
        <Scene win={win} decor={save.decor} sim={sim} blossom={blossom} species={save.species} name={save.name} height={190} size={48} />
        <div style={{ display: "flex", gap: u(4), padding: `${u(6)} ${u(6)}` }}>
          {SLOT_NAMES.map((n, i) => (
            <button
              key={n}
              type="button"
              className="lcd-btn"
              data-autofocus={slot === i ? "true" : undefined}
              data-selected={slot === i}
              aria-label={`${n}: ${save.decor[i] > 0 ? DECOR[save.decor[i] - 1].name : "empty"}`}
              onClick={() => {
                setSlot(i);
                setCand(0);
              }}
              style={{ flexDirection: "column", gap: u(2), margin: 0 }}
            >
              <span className="t-label">{n}</span>
              {save.decor[i] > 0 ? <Art grid={DECOR_SPRITES[DECOR[save.decor[i] - 1].id]} size={24} /> : <span className="t-label">Empty</span>}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: u(8) }}>
          <button type="button" className="lcd-btn" style={{ flex: "none", width: u(44), margin: 0 }} aria-label="Previous item" onClick={() => setCand((c) => wrap(c - 1, slotCands.length))}>
            {"<"}
          </button>
          <span style={lockedStyle}>{item ? <Art grid={DECOR_SPRITES[item.id]} size={32} label={item.name} /> : <span className="t-label">Empty</span>}</span>
          <button type="button" className="lcd-btn" style={{ flex: "none", width: u(44), margin: 0 }} aria-label="Next item" onClick={() => setCand((c) => wrap(c + 1, slotCands.length))}>
            {">"}
          </button>
          <button type="button" className="lcd-btn lcd-btn--primary" style={{ flex: "none", width: u(70), margin: 0 }} onClick={placeDecor}>
            Place
          </button>
        </div>
      </Frame>
    );
  };

  const renderVisit = () => (
    <Frame left={SCREEN_TITLES.visit} right={R.formatCode(ownCode)} info={info ?? "Type a neighbour's 8-letter code, then Go."}>
      <div style={{ padding: u(4), display: "flex", flexDirection: "column", gap: u(4) }}>
        <p className="t-ui-l" style={{ margin: 0, textAlign: "center", fontSize: "max(12px, calc(14 * var(--u)))" }} aria-label="Code entered">
          {Array.from({ length: 8 }, (_, i) => codeText[i] ?? "_").join(" ")}
        </p>
        <div role="group" aria-label="Code keys" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0 }}>
          {KEYS_GRID.map((k, i) => (
            <button
              key={k}
              type="button"
              className="menu-row"
              data-selected={kbSel === i}
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                setKbSel(i);
                typeKey(k);
              }}
              style={{ height: u(44), minHeight: 40, justifyContent: "center", padding: 0, border: `${u(1)} solid var(--lcd-ink)` }}
            >
              <span className="t-label">{k}</span>
            </button>
          ))}
        </div>
      </div>
    </Frame>
  );

  const renderToday = () => {
    if (!save || cards.length === 0) return null;
    const idx = Math.min(cardIndex, cards.length - 1);
    const c = cards[idx];
    const score = R.careScore(c.sim);
    return (
      <Frame left={SCREEN_TITLES.today} right={R.formatCode(ownCode)} info={info ?? `Card ready, ${score}% looked after.${cards.length > 1 ? " Left and right flip cards." : ""}`}>
        <Postcard c={c} />
        <p className="sr-only-live">
          {c.title}. Day {c.day} in {c.area}. {c.name} is {MOOD_WORD[c.mood]}. Belly {pct(c.sim.hunger)}, Fun {pct(c.sim.fun)}, Energy{" "}
          {pct(c.sim.energy)}, Clean {pct(c.sim.clean)}. {score}% looked after.
        </p>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "var(--lcd-paper)" }}>
          <Actions>
            <BigButton label="Share" keyLabel="A" primary autoFocus onClick={() => void shareCard()} />
            <BigButton label="Back" keyLabel="B" onClick={() => go("home", () => setInfo(null))} />
          </Actions>
        </div>
      </Frame>
    );
  };

  const renderBox = () => (
    <Frame left={SCREEN_TITLES.box} info={save && save.box.length > 0 ? `${save.box.length} visitor${save.box.length === 1 ? "" : "s"} so far.` : C.MSG.boxEmpty}>
      <div style={{ ...centred, justifyContent: "flex-start", paddingTop: u(14) }}>
        {save && save.box.length > 0 ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {[...save.box].reverse().map((c, i) => (
              <li key={`${c}-${i}`} className="t-ui-l" style={{ padding: `${u(3)} 0` }}>
                {R.formatCode(c)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="t-body-lcd" style={{ margin: 0 }}>
            {C.MSG.boxEmpty}
          </p>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <Actions>
          <BigButton label="Home" keyLabel="B" primary autoFocus onClick={() => go("home", () => setInfo(null))} />
        </Actions>
      </div>
    </Frame>
  );

  /** Pick a cat, dog or bird. */
  const renderSpecies = () => (
    <Frame left={TITLE_UP} info={info ?? SPECIES_INFO[SPECIES[petSel]].line}>
      <div style={{ padding: u(6) }}>
        <h2 className="t-ui-l" style={{ margin: `0 0 ${u(6)}`, textAlign: "center" }}>
          {SCREEN_TITLES.species}
        </h2>
        <ul className="menu" aria-label="Pet">
          {SPECIES.map((s, i) => (
            <li key={s} data-row>
              <button
                type="button"
                className="menu-row"
                data-selected={petSel === i}
                data-autofocus={petSel === i}
                onFocus={() => setPetSel(i)}
                onClick={() => pickSpecies(i)}
                style={{ paddingLeft: u(18) }}
              >
                <span className="caret" aria-hidden="true">
                  {">"}
                </span>
                <Art grid={PET_SPRITES[s].idle} size={24} />
                <span>{SPECIES_INFO[s].label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );

  /** Type a name with the board. Used for the intro and for renaming. */
  const renderNameEntry = (left: string, pet: Species, onGo: () => void) => (
    <Frame left={left} info={info ?? C.MSG.nameHint}>
      <div style={{ padding: `${u(6)} ${u(6)} 0`, display: "flex", flexDirection: "column", gap: u(6) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: u(6) }}>
          <Art grid={PET_SPRITES[pet].idle} size={24} />
          <span className="t-ui-l" style={{ minWidth: u(80) }} aria-label={`Name: ${nameText}`}>
            {nameText}
            <span aria-hidden="true">_</span>
          </span>
        </div>
        <NameBoard sel={nameSel} onSelect={setNameSel} onPick={(k) => typeNameKey(k, onGo)} />
      </div>
    </Frame>
  );

  const renderIntro = () => {
    if (introStep === 1) {
      return (
        <Frame left={TITLE_UP} info={info ?? C.MSG.intro1}>
          <div style={centred}>
            <Art grid={BLOSSOM} size={64} label="A trumpet flower" />
            <p className="t-display-s" style={{ margin: 0 }}>
              {C.MSG.intro1}
            </p>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
            <Actions>
              <BigButton label="Look closer" keyLabel="A" primary autoFocus onClick={() => press("a")} />
            </Actions>
          </div>
        </Frame>
      );
    }
    if (introStep === 2) return renderSpecies();
    if (introStep === 3) return renderNameEntry(SCREEN_TITLES.naming, SPECIES[petSel], confirmIntroName);
    if (introStep === 4) {
      return (
        <Frame left={TITLE_UP} info={AREA_INFO[AREAS[areaSel]].line}>
          <div style={{ padding: u(6) }}>
            <h2 className="t-ui-l" style={{ margin: `0 0 ${u(6)}`, textAlign: "center" }}>
              {C.MSG.whereTitle}
            </h2>
            <ul className="menu" aria-label="Neighbourhood">
              {AREAS.map((a, i) => (
                <li key={a} data-row>
                  <button
                    type="button"
                    className="menu-row"
                    data-selected={areaSel === i}
                    data-autofocus={areaSel === i}
                    onFocus={() => setAreaSel(i)}
                    onClick={() => {
                      setAreaSel(i);
                      setIntroStep(5);
                      play("stamp");
                    }}
                    style={{ paddingLeft: u(18) }}
                  >
                    <span className="caret" aria-hidden="true">
                      {">"}
                    </span>
                    <span>{a}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Frame>
      );
    }
    return (
      <Frame left={TITLE_UP} info={info ?? C.MSG.intro3}>
        <div style={centred}>
          <Art grid={PET_SPRITES[species].idle} size={64} label={C.name} />
          <p className="t-display-s" style={{ margin: 0 }}>
            {C.MSG.intro3}
          </p>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <Actions>
            <BigButton label="Say hello" keyLabel="A" primary autoFocus onClick={() => press("a")} />
          </Actions>
        </div>
      </Frame>
    );
  };

  const renderRename = () => renderNameEntry(SCREEN_TITLES.rename, species, finishRename);

  const renderRain = () => {
    if (!save) return null;
    const falling = rainStage !== "sky";
    return (
      <Frame left={`Day ${day}`} right={clock} info={info ?? C.MSG.rainSmell}>
        <Scene
          win={win}
          forceNight
          decor={save.decor}
          sim={sim}
          blossom
          species={save.species}
          name={save.name}
          height={240}
          happy={falling}
          rain={falling ? rainFrame % 3 : null}
        />
        {rainStage === "choice" && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "var(--lcd-paper)" }}>
            <Actions>
              <BigButton label="Open the umbrella" keyLabel="A" primary autoFocus onClick={() => chooseRain("umbrella")} />
              <BigButton label="Let it get wet" keyLabel="B" onClick={() => chooseRain("wet")} />
            </Actions>
          </div>
        )}
      </Frame>
    );
  };

  let body: ReactNode = null;
  if (screen === "intro") body = renderIntro();
  else if (screen === "home") body = renderHome();
  else if (screen === "feed") body = renderFeed();
  else if (screen === "bath") body = renderBath();
  else if (screen === "walkask") body = renderWalkAsk();
  else if (screen === "walk") body = renderWalk();
  else if (screen === "walkresult") body = renderWalkResult();
  else if (screen === "decor") body = renderDecor();
  else if (screen === "visit") body = renderVisit();
  else if (screen === "today") body = renderToday();
  else if (screen === "box") body = renderBox();
  else if (screen === "rain") body = renderRain();
  else if (screen === "rename") body = renderRename();

  return (
    <>
      <div style={{ position: "absolute", inset: 0 }} {...inertProps(overlay !== null)}>
        {body}
        {blocked && screen !== "loading" && <p className="sr-only-live">{C.MSG.storageBlocked}</p>}
      </div>

      {overlay === "pause" && (
        <PauseMenu items={pauseItems} selected={pauseSel} onSelect={setPauseSel} onActivate={activatePause} listRef={pauseListRef} />
      )}
      {overlay === "help" && <Help text={HOW_TO_PLAY} onClose={toPause} />}
      {overlay === "areas" && (
        <PauseMenu
          items={areaItems}
          selected={areaListSel}
          onSelect={setAreaListSel}
          onActivate={(i) => {
            setMoveTo(AREAS[i]);
            if (AREAS[i] === save?.area) toPause();
            else openOverlay("confirmMove");
          }}
          listRef={areaListRef}
        />
      )}
      {overlay === "confirmMove" && (
        <ConfirmDialog
          question={`Move ${C.name} to ${moveTo}? Its favourites change. Everything else stays.`}
          keep="Stay here"
          confirm="Yes, move"
          selected={dlgSel}
          onSelect={setDlgSel}
          onKeep={() => openOverlay("areas")}
          onConfirm={doMove}
        />
      )}
      {overlay === "confirmReset" && (
        <ConfirmDialog
          question={`Start over? ${C.name} on day ${day} goes, with the pantry and all decor.`}
          keep={`Keep ${C.name}`}
          confirm="Yes, start over"
          selected={dlgSel}
          onSelect={setDlgSel}
          onKeep={toPause}
          onConfirm={doReset}
        />
      )}
    </>
  );
}

const TITLE_UP = "GUNDU";
