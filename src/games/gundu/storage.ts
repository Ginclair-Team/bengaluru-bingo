import { AREAS, MOODS, SPECIES, type Area, type Food, type Mood, type Species } from "./data";
import { cleanName } from "./copy";
import { freshSim, type Sim, type VisitLog, type Visitor } from "./rules";

// v2: pets are cat, dog or bird with a name. Older v1 saves are ignored.
export const STORAGE_KEY = "bp-pet:v2";

export type RainCard = {
  day: number;
  area: Area;
  mood: Mood;
  percent: number;
  decor: [number, number, number];
  choice: "umbrella" | "wet";
};

export type Save = {
  area: Area;
  species: Species;
  /** What the player named the pet. */
  name: string;
  /** Local date the pet was planted, `YYYY-MM-DD`. */
  planted: string;
  sim: Sim;
  lastSeen: number;
  lastPat: number;
  pantry: Food[];
  /** 0 is empty; otherwise the index of the item in DECOR plus one. Rail, left floor, right floor. */
  decor: [number, number, number];
  asks: string[];
  walks: { date: string; count: number };
  totalWalks: number;
  has3Star: boolean;
  /** Distinct action types done today: feed, bath, walk, ask, share. */
  actions: { date: string; list: string[] };
  rain: { seen: boolean; choice: "umbrella" | "wet" | null; echo: string; card: RainCard | null };
  visits: VisitLog;
  visitor: Visitor | null;
  box: string[];
  ownCodes: string[];
  slow: boolean;
};

export type LoadStatus = "ok" | "missing" | "corrupt" | "blocked";

export function newSave(area: Area, species: Species, name: string, now: number, plantedKey: string): Save {
  return {
    area,
    species,
    name: cleanName(name, species),
    planted: plantedKey,
    sim: freshSim(),
    lastSeen: now,
    lastPat: 0,
    pantry: [],
    decor: [1, 0, 0],
    asks: [],
    walks: { date: "", count: 0 },
    totalWalks: 0,
    has3Star: false,
    actions: { date: "", list: [] },
    rain: { seen: false, choice: null, echo: "", card: null },
    visits: { date: "", codes: [] },
    visitor: null,
    box: [],
    ownCodes: [],
    slow: false,
  };
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const strList = (v: unknown, max = 40): string[] =>
  Array.isArray(v) ? v.filter(isStr).slice(-max) : [];
const isArea = (v: unknown): v is Area => AREAS.includes(v as Area);
const isSpecies = (v: unknown): v is Species => SPECIES.includes(v as Species);
const isFood = (v: unknown): v is Food => v === "kaapi" || v === "dosa" || v === "chaat";

function decorOf(v: unknown): [number, number, number] {
  const a = Array.isArray(v) ? v : [];
  const n = (i: number) => (isNum(a[i]) && a[i] >= 0 && a[i] <= 6 ? Math.floor(a[i]) : 0);
  return [n(0), n(1), n(2)];
}

/** Turn anything parsed from storage into a Save, or null when it is not one. */
export function sanitize(raw: unknown): Save | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const s = r.sim as Record<string, unknown> | undefined;
  if (!isArea(r.area) || !isSpecies(r.species) || !isStr(r.name)) return null;
  if (!isStr(r.planted) || !/^\d{4}-\d{2}-\d{2}$/.test(r.planted)) return null;
  if (!s || typeof s !== "object" || !isNum(r.lastSeen)) return null;
  const need = (v: unknown) => (isNum(v) ? Math.min(100, Math.max(0, v)) : NaN);
  const sim: Sim = {
    hunger: need(s.hunger),
    fun: need(s.fun),
    energy: need(s.energy),
    clean: need(s.clean),
    asleep: s.asleep === true,
    story: s.story === true,
  };
  if ([sim.hunger, sim.fun, sim.energy, sim.clean].some(Number.isNaN)) return null;
  const base = newSave(r.area, r.species, r.name, r.lastSeen, r.planted);
  const rain = (r.rain ?? {}) as Record<string, unknown>;
  const card = rain.card as Record<string, unknown> | null | undefined;
  const walks = (r.walks ?? {}) as Record<string, unknown>;
  const actions = (r.actions ?? {}) as Record<string, unknown>;
  const visits = (r.visits ?? {}) as Record<string, unknown>;
  const visitor = r.visitor as Record<string, unknown> | null | undefined;
  return {
    ...base,
    sim,
    lastPat: isNum(r.lastPat) ? r.lastPat : 0,
    pantry: Array.isArray(r.pantry) ? r.pantry.filter(isFood).slice(0, 3) : [],
    decor: decorOf(r.decor),
    asks: strList(r.asks, 8),
    walks: { date: isStr(walks.date) ? walks.date : "", count: isNum(walks.count) ? walks.count : 0 },
    totalWalks: isNum(r.totalWalks) ? r.totalWalks : 0,
    has3Star: r.has3Star === true,
    actions: { date: isStr(actions.date) ? actions.date : "", list: strList(actions.list, 5) },
    rain: {
      seen: rain.seen === true,
      choice: rain.choice === "umbrella" || rain.choice === "wet" ? rain.choice : null,
      echo: isStr(rain.echo) ? rain.echo : "",
      card:
        card && isArea(card.area) && MOODS.includes(card.mood as Mood) && isNum(card.day) && isNum(card.percent)
          ? {
              day: card.day,
              area: card.area,
              mood: card.mood as Mood,
              percent: card.percent,
              decor: decorOf(card.decor),
              choice: card.choice === "wet" ? "wet" : "umbrella",
            }
          : null,
    },
    visits: { date: isStr(visits.date) ? visits.date : "", codes: strList(visits.codes, 3) },
    visitor:
      visitor && isArea(visitor.area) && isSpecies(visitor.species) && isStr(visitor.code) && isStr(visitor.date)
        ? { area: visitor.area, species: visitor.species, code: visitor.code, date: visitor.date }
        : null,
    box: strList(r.box, 10),
    ownCodes: strList(r.ownCodes, 20),
    slow: r.slow === true,
  };
}

/** Read the save. Call from effects and handlers only, never during render. */
export function loadSave(): { save: Save | null; status: LoadStatus } {
  let text: string | null;
  try {
    text = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { save: null, status: "blocked" };
  }
  if (text === null) return { save: null, status: "missing" };
  try {
    const save = sanitize(JSON.parse(text));
    return save ? { save, status: "ok" } : { save: null, status: "corrupt" };
  } catch {
    return { save: null, status: "corrupt" };
  }
}

/** Returns false when the browser would not keep the save. */
export function writeSave(save: Save): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
