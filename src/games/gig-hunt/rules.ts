/** Gig Hunt rules. Pure: no React, no storage, no clock. */

import {
  DISTRICTS,
  LISTINGS,
  RULES,
  STATS_VERSION,
  type DistrictId,
  type Listing,
  type Track,
} from "./data";

export type Skills = Record<Track, number>;
export type Outcome = "accepted" | "rent_due" | "day21" | "quit";

export type Run = {
  seed: number;
  day: number;
  energy: number;
  bank: number;
  skills: Skills;
  home: DistrictId;
  /** Today's listing ids, drawn each morning. */
  board: string[];
  /** Listings tried today. */
  tried: string[];
  tiffinReady: boolean;
  /** Listings that produced an offer this run. They are out of the pool. */
  offerIds: string[];
  /** An offer received but not yet answered. */
  pendingOffer: string | null;
  interviews: number;
  offers: number;
  bestSalary: number;
};

export type Lifetime = {
  sessions: number;
  offers: number;
  bestSalary: number;
  streakDays: number;
  /** Local date, YYYY-MM-DD, or "". */
  lastPlayedOn: string;
};

// ---------------------------------------------------------------- small helpers

/** Fill {name} placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Rupees with Indian grouping: ₹1,20,000. A negative bank prints -₹840. */
export function money(n: number): string {
  const v = Math.round(n);
  const s = String(Math.abs(v));
  let body = s;
  if (s.length > 3) {
    const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    body = `${rest},${s.slice(-3)}`;
  }
  return `${v < 0 ? "-" : ""}₹${body}`;
}

export const listingById = (id: string): Listing | undefined => LISTINGS.find((l) => l.id === id);
export const districtTax = (id: DistrictId): number => DISTRICTS.find((d) => d.id === id)?.tax ?? 0;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Local date as YYYY-MM-DD. */
export function dateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function dayBefore(key: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return "";
  return dateKey(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) - 1));
}

// ---------------------------------------------------------------- seeded generator

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** hash(run seed, day, key) as a 32-bit seed. */
export function mixSeed(seed: number, day: number, key: string): number {
  let h = hashStr(key);
  h = Math.imul(h ^ (seed >>> 0), 2654435761);
  h = Math.imul(h ^ (h >>> 15) ^ day, 2246822519);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489917);
  return (h ^ (h >>> 16)) >>> 0;
}

/** The interview roll for one listing on one day, in [0, 1). */
export const interviewRoll = (seed: number, day: number, listingId: string): number =>
  mulberry32(mixSeed(seed, day, listingId))();

/** Three distinct listings from the pool (minus listings that produced an offer). Fewer if the pool is short. */
export function pickBoard(seed: number, day: number, offerIds: readonly string[]): string[] {
  const pool = LISTINGS.filter((l) => !offerIds.includes(l.id)).map((l) => l.id);
  const rnd = mulberry32(mixSeed(seed, day, "board"));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, RULES.boardSize);
}

// ---------------------------------------------------------------- the run

export const freshSkills = (): Skills => ({ web: 0, mobile: 0, data: 0 });

export function newRun(seed: number, home: DistrictId): Run {
  return {
    seed: seed >>> 0,
    day: 1,
    energy: RULES.energyMax,
    bank: RULES.startBank,
    skills: freshSkills(),
    home,
    board: pickBoard(seed, 1, []),
    tried: [],
    tiffinReady: false,
    offerIds: [],
    pendingOffer: null,
    interviews: 0,
    offers: 0,
    bestSalary: 0,
  };
}

export const freshLifetime = (): Lifetime => ({
  sessions: 0,
  offers: 0,
  bestSalary: 0,
  streakDays: 0,
  lastPlayedOn: "",
});

/** The listings on today's wall, in order, with their wall slot. Offers remove a note. */
export function boardRows(run: Run): { slot: number; listing: Listing; tried: boolean }[] {
  const rows: { slot: number; listing: Listing; tried: boolean }[] = [];
  run.board.forEach((id, slot) => {
    const listing = listingById(id);
    if (listing && !run.offerIds.includes(id)) rows.push({ slot, listing, tried: run.tried.includes(id) });
  });
  return rows;
}

// ---------------------------------------------------------------- interviews

export const needsTiffin = (l: Listing): boolean => l.startup && l.level >= RULES.tiffinLevel;

export function deficitFor(run: Run, l: Listing): number {
  return Math.max(0, l.level - run.skills[l.track]);
}

export function chanceFor(run: Run, l: Listing): number {
  const c = RULES.chance;
  const raw = c.base - c.perDeficit * deficitFor(run, l) - (l.startup ? c.startup : 0);
  return clamp(raw, c.floor, c.cap);
}

/** Commute tax for a listing: free from the home district. */
export const commuteFor = (run: Run, l: Listing): number => (l.district === run.home ? 0 : districtTax(l.district));

export type Detail = {
  chance: number;
  deficit: number;
  skill: number;
  tax: number;
  /** The listing needs a tiffin and none was eaten today. */
  tiffinPending: boolean;
  /** Everything still to pay to get through the door, tiffin included. */
  totalMoney: number;
  totalEnergy: number;
  /** Energy covers the interview itself. */
  canAfford: boolean;
};

export function detailFor(run: Run, l: Listing): Detail {
  const tax = commuteFor(run, l);
  const tiffinPending = needsTiffin(l) && !run.tiffinReady;
  return {
    chance: chanceFor(run, l),
    deficit: deficitFor(run, l),
    skill: run.skills[l.track],
    tax,
    tiffinPending,
    totalMoney: tax + (tiffinPending ? RULES.tiffinCost : 0),
    totalEnergy: RULES.interviewEnergy + (tiffinPending ? RULES.tiffinEnergy : 0),
    canAfford: run.energy >= RULES.interviewEnergy,
  };
}

export type InterviewBlock = "gone" | "done" | "tiffin" | "tired";

export function interviewBlock(run: Run, l: Listing): InterviewBlock | null {
  if (!run.board.includes(l.id) || run.offerIds.includes(l.id)) return "gone";
  if (run.tried.includes(l.id)) return "done";
  if (needsTiffin(l) && !run.tiffinReady) return "tiffin";
  if (run.energy < RULES.interviewEnergy) return "tired";
  return null;
}

export type InterviewResult = {
  run: Run;
  win: boolean;
  chance: number;
  deficit: number;
  tax: number;
  energy: number;
};

/** Run one interview. Call only when interviewBlock is null. */
export function interview(run: Run, l: Listing): InterviewResult {
  const chance = chanceFor(run, l);
  const deficit = deficitFor(run, l);
  const tax = commuteFor(run, l);
  const win = interviewRoll(run.seed, run.day, l.id) < chance;
  const next: Run = {
    ...run,
    bank: run.bank - tax,
    energy: run.energy - RULES.interviewEnergy,
    tried: [...run.tried, l.id],
    tiffinReady: needsTiffin(l) ? false : run.tiffinReady,
    interviews: run.interviews + 1,
  };
  if (win) {
    next.offers = run.offers + 1;
    next.bestSalary = Math.max(run.bestSalary, l.pay);
    next.offerIds = [...run.offerIds, l.id];
    next.pendingOffer = l.id;
  }
  return { run: next, win, chance, deficit, tax, energy: RULES.interviewEnergy };
}

// ---------------------------------------------------------------- other actions

export type ActionResult = { ok: true; run: Run } | { ok: false; reason: "tired" | "again" | "max" };

export function takeTiffin(run: Run): ActionResult {
  if (run.tiffinReady) return { ok: false, reason: "again" };
  if (run.energy < RULES.tiffinEnergy) return { ok: false, reason: "tired" };
  return {
    ok: true,
    run: { ...run, bank: run.bank - RULES.tiffinCost, energy: run.energy - RULES.tiffinEnergy, tiffinReady: true },
  };
}

/** Learning is allowed even when the bank is below zero. */
export function learn(run: Run, track: Track): ActionResult {
  if (run.skills[track] >= RULES.maxLevel) return { ok: false, reason: "max" };
  if (run.energy < RULES.learnEnergy) return { ok: false, reason: "tired" };
  return {
    ok: true,
    run: {
      ...run,
      bank: run.bank - RULES.learnCost,
      energy: run.energy - RULES.learnEnergy,
      skills: { ...run.skills, [track]: run.skills[track] + 1 },
    },
  };
}

export function freelance(run: Run): ActionResult {
  if (run.energy < RULES.freelanceEnergy) return { ok: false, reason: "tired" };
  return {
    ok: true,
    run: { ...run, bank: run.bank + RULES.freelancePay, energy: run.energy - RULES.freelanceEnergy },
  };
}

/** Energy below the floor ends the day on its own. */
export const mustEndDay = (run: Run): boolean => run.energy < RULES.energyFloor;

/** Decline the pending offer and keep hunting. */
export const declineOffer = (run: Run): Run => ({ ...run, pendingOffer: null });

// ---------------------------------------------------------------- the end of a day

export type RentInfo = {
  day: number;
  /** Bank after rent was taken. */
  bank: number;
  short: boolean;
  /** The next rent day, or null after the last one. */
  nextDay: number | null;
};

export type DayEnd = { run: Run; rent: RentInfo | null; outcome: Outcome | null };

export const isRentDay = (day: number): boolean => RULES.rentDays.includes(day);
export const nextRentDay = (day: number): number | null => RULES.rentDays.find((d) => d > day) ?? null;

/**
 * Close the day: take rent on rent days, check the bank, then end the run or start the next morning.
 * Rent days are the only days a run can end by itself, so a returned outcome always comes with `rent`.
 */
export function endDay(run: Run): DayEnd {
  let cur = run;
  let rent: RentInfo | null = null;
  if (isRentDay(run.day)) {
    cur = { ...run, bank: run.bank - RULES.rent };
    rent = { day: run.day, bank: cur.bank, short: cur.bank < 0, nextDay: nextRentDay(run.day) };
    if (rent.short) return { run: cur, rent, outcome: "rent_due" };
  }
  if (run.day >= RULES.days) return { run: cur, rent, outcome: "day21" };
  const day = run.day + 1;
  return {
    run: {
      ...cur,
      day,
      energy: RULES.energyMax,
      tiffinReady: false,
      tried: [],
      board: pickBoard(run.seed, day, run.offerIds),
    },
    rent,
    outcome: null,
  };
}

// ---------------------------------------------------------------- run end, stats and the JSON

export type EndInfo = {
  outcome: Outcome;
  days: number;
  interviews: number;
  offers: number;
  bestSalary: number;
  bank: number;
  skills: Skills;
  home: DistrictId;
  playedOn: string;
  /** The listing taken, for outcome "accepted". */
  acceptedId: string | null;
};

export function endInfo(run: Run, outcome: Outcome, today: string, acceptedId: string | null = null): EndInfo {
  return {
    outcome,
    days: clamp(run.day, 1, RULES.days),
    interviews: run.interviews,
    offers: run.offers,
    bestSalary: run.bestSalary,
    bank: run.bank,
    skills: { ...run.skills },
    home: run.home,
    playedOn: today,
    acceptedId,
  };
}

/** Lifetime numbers after a run ends (any outcome, quit included). */
export function recordRun(life: Lifetime, end: EndInfo): Lifetime {
  let streak = 1;
  if (life.lastPlayedOn === end.playedOn) streak = Math.max(1, life.streakDays);
  else if (life.lastPlayedOn && life.lastPlayedOn === dayBefore(end.playedOn)) streak = life.streakDays + 1;
  return {
    sessions: life.sessions + 1,
    offers: life.offers + end.offers,
    bestSalary: Math.max(life.bestSalary, end.bestSalary),
    streakDays: streak,
    lastPlayedOn: end.playedOn,
  };
}

/** The shareable file. Exactly these fields and nothing else. */
export function statsJson(e: EndInfo) {
  return {
    app: "gig-hunt",
    version: STATS_VERSION,
    outcome: e.outcome,
    days: e.days,
    interviews: e.interviews,
    offers: e.offers,
    bestSalary: e.bestSalary,
    bankEnd: e.bank,
    skills: { web: e.skills.web, mobile: e.skills.mobile, data: e.skills.data },
    home: e.home,
    playedOn: e.playedOn,
  };
}
