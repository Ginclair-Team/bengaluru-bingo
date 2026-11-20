"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCartridge, useConsoleKeys } from "@/console/context";
import type { Key } from "@/console/device/controls";
import { ConfirmDialog, Help, MenuList, type MenuItem } from "@/console/device/Overlays";
import { spriteSvg, type Sprite } from "@/lib/pixel";
import { play } from "@/lib/sound";
import {
  ACTION,
  BOLT,
  KEY,
  NOTE,
  NOTE_DONE,
  OFFER as OFFER_ART,
  SCENE,
  SLIP,
  TRACK,
  TRACK_MINI,
} from "./art";
import {
  A11Y,
  ACCEPT,
  DAY,
  DETAIL,
  DISTRICTS,
  END,
  HELP,
  LEARN,
  OFFER,
  PAUSE,
  PICK,
  QUIT,
  RENT,
  RESULT,
  RULES,
  STATS_FILE,
  SYS,
  TITLE,
  TRACKS,
  TRACK_NAMES,
  TRACK_SHORT,
} from "./data";
import * as R from "./rules";
import { loadStored, writeStored } from "./storage";

type Screen = "loading" | "title" | "pick" | "day" | "detail" | "learn" | "result" | "offer" | "rent" | "end";
type Overlay = null | "pause" | "help" | "quit" | "discard" | "accept";
type ResultView = { win: boolean; listingId: string; chance: number; deficit: number; tax: number; energy: number };

const isDir = (k: Key): k is "up" | "down" | "left" | "right" => k === "up" || k === "down" || k === "left" || k === "right";
const wrap = (n: number, size: number) => ((n % size) + size) % size;
const stepOf = (k: Key) => (k === "up" || k === "left" ? -1 : 1);
const u = (n: number) => `calc(${n} * var(--u))`;
const inertProps = (on: boolean) => (on ? ({ inert: "" } as Record<string, string>) : {});

const CSS = `
@keyframes gh-drop { from { transform: translateY(calc(-4 * var(--u))); } to { transform: none; } }
.gh-drop { animation: gh-drop 120ms steps(2) both; }
@media (prefers-reduced-motion: reduce) { .gh-drop { animation: none; } }
`;

// ---------------------------------------------------------------- drawing helpers

/** A sprite at `scale` units per cell. Pass `label` for a meaningful image, nothing for decoration. */
const Art = memo(function Art({
  grid,
  scale,
  mono = false,
  label,
}: {
  grid: Sprite;
  scale: number;
  mono?: boolean;
  label?: string;
}) {
  return (
    <span
      className="ws-art"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: u((grid[0]?.length ?? 0) * scale), height: u(grid.length * scale), flex: "none" }}
      dangerouslySetInnerHTML={{ __html: spriteSvg(grid, { mono }) }}
    />
  );
});

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
      <div className="lcd-header t-ui-s">
        <span>{left}</span>
        {right && <span>{right}</span>}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>{children}</div>
      <div
        role="status"
        className="t-body-lcd"
        style={{
          flex: "none",
          height: u(30),
          minHeight: 28,
          padding: `0 ${u(8)}`,
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

/** One selectable row. The selected row is inverted by the console's menu-row style. */
function Row({
  selected,
  onActivate,
  onFocus,
  height = 28,
  label,
  children,
}: {
  selected: boolean;
  onActivate: () => void;
  onFocus: () => void;
  height?: number;
  label?: string;
  children: ReactNode;
}) {
  return (
    <li data-row>
      <button
        type="button"
        className="menu-row"
        data-selected={selected}
        data-autofocus={selected}
        aria-label={label}
        onFocus={onFocus}
        onClick={(e) => {
          e.currentTarget.blur();
          onActivate();
        }}
        style={{ height: u(height), minHeight: 26 }}
      >
        <span className="caret" aria-hidden="true">
          {">"}
        </span>
        {children}
      </button>
    </li>
  );
}

const Line = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: u(8) }}>
    <span className="t-label">{label}</span>
    <span className="t-body-lcd">{value}</span>
  </div>
);

const colStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: u(6),
  padding: u(8),
  textAlign: "center" as const,
};

// ---------------------------------------------------------------- the scene

/** Sticky-note boxes in SCENE (top-left of each 9 x 9 note). The pin sits 3 cells in, 2 cells above. */
const NOTE_BOXES = [
  { x: 30, y: 6 },
  { x: 41, y: 7 },
  { x: 52, y: 5 },
] as const;

type NoteState = "open" | "tried" | "gone";

/** SCENE with tried notes grey and removed notes bare wall. */
function paintScene(states: readonly NoteState[]): Sprite {
  const rows = SCENE.map((r) => r.split(""));
  NOTE_BOXES.forEach(({ x, y }, i) => {
    const state = states[i] ?? "gone";
    if (state === "open") return;
    for (let r = y; r < y + 9; r++) {
      for (let c = x; c < x + 9; c++) {
        const k = rows[r][c];
        if (state === "gone") rows[r][c] = "C";
        else if (k === "P") rows[r][c] = "S";
        else if (k === "M") rows[r][c] = "H";
      }
    }
    if (state === "gone") for (let r = y - 2; r < y; r++) for (let c = x + 3; c < x + 6; c++) rows[r][c] = "C";
  });
  return rows.map((r) => r.join(""));
}

function Scene({ scale, states, mark }: { scale: number; states: readonly NoteState[]; mark?: number }) {
  const key = states.join("|");
  const grid = useMemo(() => paintScene(key.split("|") as NoteState[]), [key]);
  const open = states.filter((s) => s !== "gone").length;
  const box = mark === undefined ? null : NOTE_BOXES[mark];
  return (
    <div
      style={{
        position: "relative",
        width: u(64 * scale),
        height: u(44 * scale),
        flex: "none",
        boxShadow: `0 0 0 ${u(2)} var(--lcd-ink)`,
      }}
    >
      <Art grid={grid} scale={scale} label={R.fill(A11Y.scene, { n: open })} />
      {box && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: u((box.x - 1) * scale),
            top: u((box.y - 1) * scale),
            width: u(11 * scale),
            height: u(11 * scale),
            border: `${u(2)} dashed var(--lcd-ink)`,
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- the game

/** Three weeks in Bengaluru to land a first gig, hunted from a PG room desk. */
export function GigHuntGame() {
  const { host, lcd } = useCartridge();

  const [screen, setScreen] = useState<Screen>("loading");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [run, setRun] = useState<R.Run | null>(null);
  const [life, setLife] = useState<R.Lifetime>(R.freshLifetime());
  const [info, setInfo] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [result, setResult] = useState<ResultView | null>(null);
  const [rent, setRent] = useState<R.RentInfo | null>(null);
  const [end, setEnd] = useState<R.EndInfo | null>(null);

  const [titleSel, setTitleSel] = useState(0);
  const [pickSel, setPickSel] = useState(0);
  const [daySel, setDaySel] = useState(0);
  const [learnSel, setLearnSel] = useState(0);
  const [offerSel, setOfferSel] = useState(0);
  const [pauseSel, setPauseSel] = useState(0);
  const [dlgSel, setDlgSel] = useState<0 | 1>(0);

  const pauseListRef = useRef<HTMLUListElement>(null);
  const warned = useRef(false);

  const go = useCallback(
    (next: Screen, after?: () => void) => {
      host.transition(() => {
        setScreen(next);
        after?.();
      });
    },
    [host]
  );

  const flash = (line: string, sound: "error" | "stamp" | "move" | "chime" | null = null) => {
    setInfo(line);
    if (sound) play(sound);
  };

  // ---- Read the record after mount, never during render ----
  useEffect(() => {
    const { stored, status } = loadStored();
    setRun(stored.run);
    setLife(stored.lifetime);
    if (status === "blocked") {
      warned.current = true;
      setInfo(SYS.storageBlocked);
    }
    setScreen("title");
  }, []);

  /** Keep the run and lifetime in memory and write them. Says so once if the browser refuses. */
  const persist = (nextRun: R.Run | null, nextLife: R.Lifetime = life) => {
    setRun(nextRun);
    setLife(nextLife);
    if (!writeStored({ run: nextRun, lifetime: nextLife }) && !warned.current) {
      warned.current = true;
      setInfo(SYS.storageBlocked);
      host.announce(SYS.storageBlocked);
    }
  };

  // ---------------------------------------------------------------- run flow

  const startRun = (homeIndex: number) => {
    const seed = Math.floor(Math.random() * 4294967296) >>> 0;
    const next = R.newRun(seed, DISTRICTS[homeIndex].id);
    persist(next);
    setEnd(null);
    setRent(null);
    setResult(null);
    setDaySel(0);
    play("stamp");
    go("day", () => setInfo(DAY.welcome));
  };

  const toPick = () => {
    setPickSel(0);
    go("pick", () => setInfo(null));
  };

  const resume = () => {
    if (!run) return;
    play("stamp");
    if (run.pendingOffer) go("offer", () => setInfo(null));
    else go("day", () => setInfo(null));
  };

  /** A run is over, whatever the way. Records the stats and clears the saved run. */
  const conclude = (r: R.Run, outcome: R.Outcome, acceptedId: string | null) => {
    const e = R.endInfo(r, outcome, R.dateKey(new Date()), acceptedId);
    persist(null, R.recordRun(life, e));
    setEnd(e);
  };

  /** Close the day: rent, the bank check, then the next morning or the end of the run. */
  const endTheDay = (r: R.Run, why: "sleep" | "auto") => {
    const d = R.endDay(r);
    if (d.outcome) {
      conclude(d.run, d.outcome, null);
      setRent(d.rent);
      play("error");
      go("rent", () => setInfo(null));
      return;
    }
    persist(d.run);
    if (d.rent) {
      setRent(d.rent);
      play("stamp");
      go("rent", () => {
        setDaySel(0);
        setInfo(null);
      });
      return;
    }
    go("day", () => {
      setDaySel(0);
      setInfo(why === "auto" ? DAY.autoEnd : R.fill(DAY.sleepLine, { d: d.run.day }));
    });
  };

  /** Back to the day, or straight to bedtime if the energy has run out. */
  const backToDay = (r: R.Run, line: string | null) => {
    if (R.mustEndDay(r)) endTheDay(r, "auto");
    else go("day", () => setInfo(line));
  };

  // ---------------------------------------------------------------- day actions

  const openStop = (i: number) => {
    if (!run) return;
    const rows = R.boardRows(run);
    if (i < rows.length) {
      const row = rows[i];
      if (row.tried) {
        flash(DAY.done, "error");
        return;
      }
      play("move");
      setDetailId(row.listing.id);
      go("detail", () => setInfo(null));
      return;
    }
    const action = i - rows.length;
    if (action === 0) {
      play("move");
      go("learn", () => setInfo(null));
    } else if (action === 1) {
      const r = R.takeTiffin(run);
      if (!r.ok) flash(r.reason === "again" ? DAY.tiffinAgain : DAY.tired, "error");
      else {
        persist(r.run);
        play("stamp");
        if (R.mustEndDay(r.run)) endTheDay(r.run, "auto");
        else flash(DAY.tiffinDone);
      }
    } else if (action === 2) {
      const r = R.freelance(run);
      if (!r.ok) flash(DAY.tired, "error");
      else {
        persist(r.run);
        play("stamp");
        if (R.mustEndDay(r.run)) endTheDay(r.run, "auto");
        else flash(R.fill(DAY.freelanceDone, { pay: R.money(RULES.freelancePay) }));
      }
    } else {
      play("close");
      endTheDay(run, "sleep");
    }
  };

  const apply = () => {
    const listing = detailId ? R.listingById(detailId) : undefined;
    if (!run || !listing) return;
    const block = R.interviewBlock(run, listing);
    if (block === "tiffin") return flash(DAY.tiffinFirst, "error");
    if (block === "tired") return flash(DETAIL.tired, "error");
    if (block) {
      go("day", () => setInfo(DAY.done));
      return;
    }
    const r = R.interview(run, listing);
    persist(r.run);
    setResult({ win: r.win, listingId: listing.id, chance: r.chance, deficit: r.deficit, tax: r.tax, energy: r.energy });
    play(r.win ? "bingo" : "error");
    go("result", () => setInfo(null));
  };

  const afterResult = () => {
    if (!run || !result) return;
    if (result.win) {
      setOfferSel(0);
      host.flashLed();
      play("chime");
      go("offer", () => setInfo(null));
    } else backToDay(run, null);
  };

  const doLearn = () => {
    if (!run) return;
    const track = TRACKS[learnSel];
    const r = R.learn(run, track);
    if (!r.ok) {
      flash(r.reason === "max" ? R.fill(LEARN.max, { track: TRACK_NAMES[track] }) : DAY.tired, "error");
      return;
    }
    persist(r.run);
    play("stamp");
    backToDay(r.run, R.fill(LEARN.done, { track: TRACK_NAMES[track], n: r.run.skills[track] }));
  };

  const pickOffer = (i: number) => {
    if (!run) return;
    if (i === 0) {
      openOverlay("accept");
      return;
    }
    const next = R.declineOffer(run);
    persist(next);
    play("move");
    backToDay(next, OFFER.kept);
  };

  // ---------------------------------------------------------------- the stats file

  const shareStats = async () => {
    if (!end) return;
    const json = JSON.stringify(R.statsJson(end), null, 2);
    try {
      const file = new File([json], STATS_FILE, { type: "application/json" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: END.button });
        flash(END.shared, "chime");
        return;
      }
    } catch (e) {
      // The player closed the share sheet: say nothing. Any other share failure falls back to a download.
      if (e instanceof Error && e.name === "AbortError") return;
    }
    try {
      const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = STATS_FILE;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      flash(END.saved, "chime");
    } catch {
      flash(END.shareFail, "error");
    }
  };

  // ---------------------------------------------------------------- overlays

  const openOverlay = (o: Exclude<Overlay, null>) => {
    if (o === "pause") setPauseSel(0);
    setDlgSel(0);
    setOverlay(o);
    play("open");
  };

  const closeOverlay = () => {
    setOverlay(null);
    play("close");
  };

  const canQuit = run !== null && screen !== "title" && screen !== "pick";

  const pauseItems: MenuItem[] = [
    { id: "resume", label: PAUSE.resume },
    { id: "help", label: PAUSE.help },
    { id: "sound", label: host.muted ? PAUSE.soundOff : PAUSE.soundOn },
    { id: "quit", label: PAUSE.quit, disabled: !canQuit },
  ];

  const activatePause = (i: number) => {
    const id = pauseItems[i].id;
    if (id === "resume") closeOverlay();
    else if (id === "help") openOverlay("help");
    else if (id === "sound") host.toggleSound();
    else if (canQuit) openOverlay("quit");
    else play("error");
  };

  const confirmDialog = () => {
    if (overlay === "discard") {
      setOverlay(null);
      toPick();
    } else if (overlay === "quit" && run) {
      setOverlay(null);
      conclude(run, "quit", null);
      play("stamp");
      go("end", () => setInfo(null));
    } else if (overlay === "accept" && run?.pendingOffer) {
      setOverlay(null);
      conclude(run, "accepted", run.pendingOffer);
      play("bingo");
      go("end", () => setInfo(null));
    }
  };

  const cancelDialog = () => {
    if (overlay === "quit") setOverlay("pause");
    else setOverlay(null);
    play("close");
  };

  // ---------------------------------------------------------------- keys

  const press = (key: Key) => {
    if (screen === "loading") return;

    if (overlay === "pause") {
      if (key === "up" || key === "down") {
        setPauseSel((s) => wrap(s + stepOf(key), pauseItems.length));
        play("move");
      } else if (key === "a" || key === "continue") activatePause(pauseSel);
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
    if (overlay) {
      if (isDir(key)) {
        setDlgSel((s) => (s === 0 ? 1 : 0));
        play("move");
      } else if (key === "a" || key === "continue") {
        // A and CONTINUE act on the highlighted button. The safe one (keep) is highlighted first.
        if (dlgSel === 1) confirmDialog();
        else cancelDialog();
      } else cancelDialog();
      return;
    }

    if (key === "menu") {
      openOverlay("pause");
      return;
    }

    switch (screen) {
      case "title": {
        const count = run ? 2 : 1;
        if (isDir(key)) {
          setTitleSel((s) => wrap(s + stepOf(key), count));
          play("move");
        } else if (key === "a") {
          if (run && titleSel === 0) resume();
          else if (run) openOverlay("discard");
          else toPick();
        } else if (key === "continue") {
          if (run) resume();
          else toPick();
        }
        return;
      }
      case "pick":
        if (isDir(key)) {
          setPickSel((s) => wrap(s + stepOf(key), DISTRICTS.length));
          play("move");
        } else if (key === "a" || key === "continue") startRun(pickSel);
        else if (key === "b") go("title", () => setInfo(null));
        return;
      case "day": {
        if (!run) return;
        const stops = R.boardRows(run).length + 4;
        const sel = Math.min(daySel, stops - 1);
        if (isDir(key)) {
          setDaySel(wrap(sel + stepOf(key), stops));
          play("move");
        } else if (key === "a" || key === "continue") openStop(sel);
        else if (key === "b") {
          play("close");
          endTheDay(run, "sleep");
        }
        return;
      }
      case "detail":
        if (key === "a" || key === "continue") apply();
        else if (key === "b") go("day", () => setInfo(null));
        return;
      case "learn":
        if (key === "up" || key === "down") {
          setLearnSel((s) => wrap(s + stepOf(key), TRACKS.length));
          play("move");
        } else if (key === "a" || key === "continue") doLearn();
        else if (key === "b") go("day", () => setInfo(null));
        return;
      case "result":
        if (key === "a" || key === "continue") afterResult();
        return;
      case "offer":
        if (key === "up" || key === "down") {
          setOfferSel((s) => (s === 0 ? 1 : 0));
          play("move");
        } else if (key === "a" || key === "continue") pickOffer(offerSel);
        return;
      case "rent":
        if (key === "a" || key === "continue") {
          play("move");
          if (end) go("end", () => setInfo(null));
          else go("day", () => setInfo(null));
        }
        return;
      case "end":
        if (key === "a" || key === "continue") void shareStats();
        else if (key === "b") {
          play("move");
          toPick();
        }
        return;
    }
  };

  useConsoleKeys(press);

  // ---- Focus follows the selected row or the primary button, inside the LCD ----
  const focusKey = `${screen}|${overlay}|${titleSel}|${pickSel}|${daySel}|${learnSel}|${offerSel}|${pauseSel}|${dlgSel}`;
  useEffect(() => {
    const root = lcd.current;
    if (!root) return;
    const scope = overlay ? ".overlay " : "";
    root.querySelector<HTMLElement>(`${scope}[data-autofocus="true"]`)?.focus({ preventScroll: true });
  }, [focusKey, overlay, lcd]);

  // ---------------------------------------------------------------- legends

  const dayRows = run ? R.boardRows(run) : [];
  const dayStops = dayRows.length + 4;
  const daySelC = Math.min(daySel, dayStops - 1);
  const titleSelC = run ? titleSel : 0;

  let legendA = "";
  let legendB = "";
  if (overlay === "pause") {
    legendA = "PICK";
    legendB = "RESUME";
  } else if (overlay === "help") {
    legendA = "OK";
    legendB = "BACK";
  } else if (overlay) {
    // A names the highlighted button, so it never reads YES while NO is lit.
    legendA = dlgSel === 1 ? "YES" : "NO";
    legendB = "NO";
  } else if (screen === "title") {
    legendA = run && titleSelC === 0 ? "PLAY" : "NEW RUN";
  } else if (screen === "pick") {
    legendA = "HOME";
    legendB = "BACK";
  } else if (screen === "day") {
    legendA = daySelC < dayRows.length ? "OPEN" : ["LEARN", "TIFFIN", "GIG", "SLEEP"][daySelC - dayRows.length];
    legendB = "SLEEP";
  } else if (screen === "detail") {
    legendA = "APPLY";
    legendB = "BACK";
  } else if (screen === "learn") {
    legendA = "LEARN";
    legendB = "BACK";
  } else if (screen === "result") {
    legendA = "NEXT";
  } else if (screen === "offer") {
    legendA = "PICK";
  } else if (screen === "rent") {
    legendA = "OK";
  } else if (screen === "end") {
    legendA = "STATS";
    legendB = "AGAIN";
  }
  useEffect(() => {
    host.setLegends({ a: legendA, b: legendB });
  }, [host, legendA, legendB]);

  // ---------------------------------------------------------------- screens

  const renderTitle = () => (
    <Frame left={TITLE.header} info={info ?? ""}>
      <div style={{ ...colStyle, gap: u(8), padding: `${u(8)} ${u(8)} 0` }}>
        <Art grid={SCENE} scale={3} label={R.fill(A11Y.scene, { n: 3 })} />
        <p className="t-body-lcd" style={{ margin: 0 }}>
          {TITLE.lede}
        </p>
      </div>
      <ul className="menu" aria-label="Start" style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        {run && (
          <Row selected={titleSelC === 0} onFocus={() => setTitleSel(0)} onActivate={resume}>
            <span>{TITLE.continue}</span>
            <span className="sub t-label">{R.fill(TITLE.saved, { d: run.day, bank: R.money(run.bank) })}</span>
          </Row>
        )}
        <Row
          selected={titleSelC === (run ? 1 : 0)}
          onFocus={() => setTitleSel(run ? 1 : 0)}
          onActivate={() => (run ? openOverlay("discard") : toPick())}
        >
          <span>{TITLE.new}</span>
        </Row>
      </ul>
    </Frame>
  );

  const renderPick = () => (
    <Frame left={PICK.header} right={R.fill(PICK.count, { n: pickSel + 1 })} info={info ?? PICK.note}>
      <div style={{ display: "flex", alignItems: "center", gap: u(8), padding: `${u(6)} ${u(10)}` }}>
        <Art grid={KEY} scale={3} />
        <p className="t-body-lcd" style={{ margin: 0 }}>
          {PICK.q}
        </p>
      </div>
      <ul className="menu" aria-label="Home district">
        {DISTRICTS.map((d, i) => (
          <Row key={d.id} selected={pickSel === i} onFocus={() => setPickSel(i)} onActivate={() => startRun(i)}>
            <span>{d.id}</span>
            <span className="sub t-label">{R.money(d.tax)}</span>
          </Row>
        ))}
      </ul>
    </Frame>
  );

  const defaultDayLine = (r: R.Run): string => {
    if (r.day === 1 && r.interviews === 0 && r.tried.length === 0 && r.energy === RULES.energyMax) return DAY.welcome;
    if (r.bank < 0) return R.fill(DAY.red, { d: RULES.rentDays.find((d) => d >= r.day) ?? RULES.days });
    if (RULES.rentDays.includes(r.day + 1)) return DAY.rentSoon;
    return r.energy === RULES.energyMax ? DAY.morning : "";
  };

  const renderDay = () => {
    if (!run) return null;
    const states: NoteState[] = run.board.map((id) =>
      run.offerIds.includes(id) ? "gone" : run.tried.includes(id) ? "tried" : "open"
    );
    const marked = daySelC < dayRows.length ? dayRows[daySelC].slot : undefined;
    const actions = [
      { art: ACTION.learn, word: DAY.learn },
      { art: ACTION.tiffin, word: DAY.tiffin },
      { art: ACTION.freelance, word: DAY.freelance },
      { art: ACTION.sleep, word: DAY.sleep },
    ];
    const line = info ?? (dayRows.length === 0 ? DAY.empty : defaultDayLine(run));
    return (
      <Frame left={R.fill(DAY.header, { d: run.day })} right={R.money(run.bank)} info={line}>
        <div style={{ display: "flex", gap: u(10), padding: u(8), alignItems: "flex-start" }}>
          <Scene scale={2} states={states} mark={marked} />
          <div className="t-label" style={{ display: "flex", flexDirection: "column", gap: u(4), minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: u(4) }}>
              <Art grid={BOLT} scale={1.5} mono />
              {R.fill(DAY.energy, { e: run.energy })}
            </span>
            {TRACKS.map((t) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: u(4) }}>
                <Art grid={TRACK_MINI[t]} scale={1.5} mono />
                {TRACK_SHORT[t]} {run.skills[t]}
              </span>
            ))}
            <span>{DAY.home}</span>
            <span>{run.home}</span>
          </div>
        </div>
        <ul className="menu" aria-label="Job notes">
          {dayRows.map((row, i) => (
            <Row
              key={row.listing.id}
              selected={daySelC === i}
              onFocus={() => setDaySel(i)}
              onActivate={() => openStop(i)}
              height={26}
            >
              <Art grid={row.tried ? NOTE_DONE : NOTE} scale={2} />
              <span>{row.listing.short}</span>
              <span className="sub t-label">
                {row.tried
                  ? DAY.rowDone
                  : `${R.fill(DAY.rowLevel, { n: row.listing.level })} ${R.money(row.listing.pay)}`}
              </span>
            </Row>
          ))}
        </ul>
        <div role="group" aria-label="Actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {actions.map((a, i) => {
            const stop = dayRows.length + i;
            return (
              <button
                key={a.word}
                type="button"
                className="menu-row"
                data-selected={daySelC === stop}
                data-autofocus={daySelC === stop}
                onFocus={() => setDaySel(stop)}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setDaySel(stop);
                  openStop(stop);
                }}
                style={{ height: u(26), minHeight: 26, padding: `0 ${u(8)}` }}
              >
                <Art grid={a.art} scale={1.5} mono />
                <span>{a.word}</span>
              </button>
            );
          })}
        </div>
      </Frame>
    );
  };

  const renderDetail = () => {
    const l = detailId ? R.listingById(detailId) : undefined;
    if (!run || !l) return null;
    const d = R.detailFor(run, l);
    const pct = Math.round(d.chance * 100);
    const foot = d.tiffinPending
      ? DETAIL.needTiffin
      : !d.canAfford
        ? DETAIL.tired
        : l.startup
          ? DETAIL.startup
          : DETAIL.company;
    return (
      <Frame left={l.title.toUpperCase()} right={l.startup ? DETAIL.kindStartup : DETAIL.kindCompany} info={info ?? foot}>
        <div style={{ display: "flex", flexDirection: "column", gap: u(6), padding: u(8) }}>
          <div style={{ display: "flex", alignItems: "center", gap: u(10) }}>
            <Art grid={TRACK[l.track]} scale={2} label={TRACK_NAMES[l.track]} />
            <div style={{ display: "flex", flexDirection: "column", gap: u(3) }} className="t-body-lcd">
              <span>{R.fill(DETAIL.track, { track: TRACK_NAMES[l.track], n: l.level })}</span>
              <span>{R.fill(DETAIL.you, { track: TRACK_NAMES[l.track], n: d.skill })}</span>
              <span>{l.district}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="t-label">{DETAIL.chance}</span>
            <span className="t-display-l" aria-label={R.fill(A11Y.chance, { p: pct })}>
              {pct}%
            </span>
          </div>
          <Line label={DETAIL.pay} value={R.fill(DETAIL.payValue, { pay: R.money(l.pay) })} />
          <Line label={DETAIL.commute} value={d.tax === 0 ? DETAIL.commuteHome : R.money(d.tax)} />
          {d.tiffinPending && <Line label={DETAIL.tiffinLabel} value={R.money(RULES.tiffinCost)} />}
          <Line
            label={DETAIL.total}
            value={R.fill(DETAIL.totalValue, { cost: R.money(d.totalMoney), e: d.totalEnergy })}
          />
        </div>
      </Frame>
    );
  };

  const renderLearn = () => {
    if (!run) return null;
    const track = TRACKS[learnSel];
    const maxed = run.skills[track] >= RULES.maxLevel;
    return (
      <Frame
        left={LEARN.header}
        right={R.fill(LEARN.each, { cost: R.money(RULES.learnCost) })}
        info={info ?? (maxed ? R.fill(LEARN.max, { track: TRACK_NAMES[track] }) : "")}
      >
        <ul className="menu" aria-label="Tracks">
          {TRACKS.map((t, i) => {
            const level = run.skills[t];
            return (
              <Row
                key={t}
                selected={learnSel === i}
                onFocus={() => setLearnSel(i)}
                onActivate={doLearn}
                height={36}
                label={R.fill(A11Y.levels, { track: TRACK_NAMES[t], n: level })}
              >
                <Art grid={TRACK[t]} scale={1} />
                <span>{TRACK_NAMES[t]}</span>
                <span className="sub" aria-hidden="true">
                  {Array.from({ length: RULES.maxLevel }, (_, b) => (
                    <span
                      key={b}
                      style={{
                        width: u(6),
                        height: u(6),
                        border: `${u(1)} solid currentColor`,
                        background: b < level ? "currentColor" : "transparent",
                      }}
                    />
                  ))}
                  <span className="t-label" style={{ marginLeft: u(2) }}>
                    {level}
                  </span>
                </span>
              </Row>
            );
          })}
        </ul>
        <p className="t-body-lcd" style={{ margin: 0, padding: `${u(10)} ${u(10)} 0` }}>
          {LEARN.cost}
        </p>
      </Frame>
    );
  };

  const renderResult = () => {
    const l = result ? R.listingById(result.listingId) : undefined;
    if (!run || !result || !l) return null;
    return (
      <Frame left={RESULT.header} right={R.fill(RESULT.headerRight, { d: run.day })} info={info ?? ""}>
        {result.win ? (
          <div style={{ ...colStyle, height: "100%" }}>
            <Art grid={OFFER_ART} scale={4} />
            <p className="t-ui-l" style={{ margin: 0, fontSize: "max(12px, calc(14 * var(--u)))" }}>
              {RESULT.win}
            </p>
            <p className="t-body-lcd" style={{ margin: 0 }}>
              {l.title}
            </p>
          </div>
        ) : (
          <div style={{ ...colStyle, height: "100%" }}>
            <span className="gh-drop">
              <Art grid={SLIP} scale={6} />
            </span>
            <p className="t-ui-l" style={{ margin: 0, fontSize: "max(12px, calc(14 * var(--u)))" }}>
              {RESULT.lose}
            </p>
            <p className="t-body-lcd" style={{ margin: 0 }}>
              {R.fill(RESULT.chance, { p: Math.round(result.chance * 100) })}
              <br />
              {R.fill(RESULT.spent, { cost: R.money(result.tax), e: result.energy })}
              <br />
              {result.deficit > 0 ? RESULT.tip : RESULT.luck}
            </p>
          </div>
        )}
      </Frame>
    );
  };

  const renderOffer = () => {
    const l = run?.pendingOffer ? R.listingById(run.pendingOffer) : undefined;
    if (!l) return null;
    return (
      <Frame left={OFFER.title} info={info ?? ""}>
        <div style={{ ...colStyle, gap: u(8), paddingBottom: 0 }}>
          <Art grid={OFFER_ART} scale={4} />
          <span className="t-label">{OFFER.salaryLabel}</span>
          <span className="t-display-s">{R.money(l.pay)}</span>
          <span className="t-body-lcd">{OFFER.perMonth}</span>
          <span className="t-body-lcd">{l.title}</span>
        </div>
        <ul className="menu" aria-label="Offer" style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <Row selected={offerSel === 0} onFocus={() => setOfferSel(0)} onActivate={() => pickOffer(0)}>
            <span>{OFFER.accept}</span>
          </Row>
          <Row selected={offerSel === 1} onFocus={() => setOfferSel(1)} onActivate={() => pickOffer(1)}>
            <span>{OFFER.keep}</span>
          </Row>
        </ul>
      </Frame>
    );
  };

  const renderRent = () => {
    if (!rent) return null;
    return (
      <Frame left={RENT.header} right={R.fill(RENT.headerRight, { d: rent.day })} info={info ?? ""}>
        <div style={{ ...colStyle, height: "100%" }}>
          <Art grid={KEY} scale={6} />
          {rent.short ? (
            <>
              <p className="t-ui-l" style={{ margin: 0, fontSize: "max(12px, calc(14 * var(--u)))" }}>
                {RENT.due}
              </p>
              <p className="t-body-lcd" style={{ margin: 0 }}>
                {R.fill(RENT.bank, { bank: R.money(rent.bank) })}
                <br />
                {RENT.short}
              </p>
            </>
          ) : (
            <>
              <p className="t-ui-l" style={{ margin: 0, fontSize: "max(12px, calc(14 * var(--u)))" }}>
                {RENT.paid}
              </p>
              <p className="t-body-lcd" style={{ margin: 0 }}>
                {RENT.paid2}
                <br />
                {R.fill(RENT.bank, { bank: R.money(rent.bank) })}
                {rent.nextDay !== null && (
                  <>
                    <br />
                    {R.fill(RENT.next, { d: rent.nextDay })}
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </Frame>
    );
  };

  const renderEnd = () => {
    if (!end) return null;
    const accepted = end.acceptedId ? R.listingById(end.acceptedId) : undefined;
    let sprite: Sprite = NOTE_DONE;
    let spriteScale = 2;
    let head: string = END.quit;
    let sub: string = END.quitSub;
    if (end.outcome === "accepted") {
      sprite = OFFER_ART;
      spriteScale = 1;
      head = END.accepted;
      sub = accepted ? R.fill(END.acceptedSub, { title: accepted.title, pay: R.money(accepted.pay) }) : "";
    } else if (end.outcome === "rent_due") {
      sprite = KEY;
      head = END.rent;
      sub = END.rentSub;
    } else if (end.outcome === "day21" && end.offers === 0) {
      sprite = SLIP;
      head = END.none;
      sub = END.noneSub;
    } else if (end.outcome === "day21") {
      sprite = NOTE;
      head = END.day21;
      sub = end.offers === 1 ? END.day21SubOne : R.fill(END.day21Sub, { n: end.offers });
    }
    return (
      <Frame left={END.header} info={info ?? END.share}>
        <div style={{ display: "flex", flexDirection: "column", gap: u(6), padding: u(8) }}>
          <div style={{ display: "flex", alignItems: "center", gap: u(8) }}>
            <Art grid={sprite} scale={spriteScale} />
            <span className="t-ui-l" style={{ fontSize: "max(12px, calc(14 * var(--u)))" }}>
              {head}
            </span>
          </div>
          <p className="t-body-lcd" style={{ margin: 0 }}>
            {sub}
          </p>
          <Line label={END.days} value={String(end.days)} />
          <Line label={END.interviews} value={String(end.interviews)} />
          <Line label={END.offers} value={String(end.offers)} />
          <Line label={END.best} value={end.bestSalary > 0 ? R.money(end.bestSalary) : END.bestNone} />
          <Line label={END.bank} value={R.money(end.bank)} />
        </div>
      </Frame>
    );
  };

  let body: ReactNode = null;
  if (screen === "title") body = renderTitle();
  else if (screen === "pick") body = renderPick();
  else if (screen === "day") body = renderDay();
  else if (screen === "detail") body = renderDetail();
  else if (screen === "learn") body = renderLearn();
  else if (screen === "result") body = renderResult();
  else if (screen === "offer") body = renderOffer();
  else if (screen === "rent") body = renderRent();
  else if (screen === "end") body = renderEnd();

  const dialogListing = run?.pendingOffer ? R.listingById(run.pendingOffer) : undefined;

  return (
    <>
      <style>{CSS}</style>
      <div style={{ position: "absolute", inset: 0 }} {...inertProps(overlay !== null)}>
        {body}
      </div>

      {overlay === "pause" && (
        <>
          <div className="dim-stage" aria-hidden="true" />
          <div className="overlay">
            <div className="dlg dlg--menu" role="dialog" aria-modal="true" aria-label={PAUSE.header}>
              <div
                className="t-ui-s"
                style={{ display: "flex", justifyContent: "space-between", padding: `${u(6)} ${u(10)}` }}
              >
                <span>{PAUSE.header}</span>
                {run && <span>{R.fill(PAUSE.headerRight, { d: run.day })}</span>}
              </div>
              <MenuList
                items={pauseItems}
                selected={pauseSel}
                onSelect={setPauseSel}
                onActivate={activatePause}
                listRef={pauseListRef}
                label={PAUSE.header}
              />
              <p className="t-body-lcd" style={{ margin: 0, padding: `${u(6)} ${u(10)}` }}>
                {PAUSE.note}
              </p>
            </div>
          </div>
        </>
      )}
      {overlay === "help" && <Help text={HELP.join(" ")} title={PAUSE.help} onClose={() => setOverlay("pause")} />}
      {overlay === "discard" && (
        <ConfirmDialog
          question={`${TITLE.discardQ} ${TITLE.discardBody}`}
          keep={TITLE.discardKeep}
          confirm={TITLE.discardYes}
          selected={dlgSel}
          onSelect={setDlgSel}
          onKeep={cancelDialog}
          onConfirm={confirmDialog}
        />
      )}
      {overlay === "quit" && (
        <ConfirmDialog
          question={`${QUIT.q} ${QUIT.body}`}
          keep={QUIT.keep}
          confirm={QUIT.yes}
          selected={dlgSel}
          onSelect={setDlgSel}
          onKeep={cancelDialog}
          onConfirm={confirmDialog}
        />
      )}
      {overlay === "accept" && dialogListing && (
        <ConfirmDialog
          question={`${ACCEPT.title} ${R.fill(ACCEPT.body, { title: dialogListing.title, pay: R.money(dialogListing.pay) })} ${ACCEPT.note}`}
          keep={ACCEPT.no}
          confirm={ACCEPT.yes}
          selected={dlgSel}
          onSelect={setDlgSel}
          onKeep={cancelDialog}
          onConfirm={confirmDialog}
        />
      )}
    </>
  );
}
