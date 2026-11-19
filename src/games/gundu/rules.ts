// Pure rules for the pet game. No React, no storage, no clock: every function that
// needs "now" takes it as a millisecond argument. Lines that name the pet take the name.

import { copyFor } from "./copy";
import {
  AREAS,
  AREA_INFO,
  ASK_TEXT,
  DECOR,
  MOODS,
  MSG,
  SPECIES,
  SPECIES_INFO,
  type Area,
  type DecorId,
  type Food,
  type FoodOrIdli,
  type Mood,
  type Species,
  type Taste,
  type WindowId,
} from "./data";

export type Sim = {
  hunger: number;
  fun: number;
  energy: number;
  clean: number;
  asleep: boolean;
  /** A bedtime story: sleep gain is 0.75/min until the next wake. */
  story: boolean;
};

export const NEED_KEYS = ["hunger", "fun", "energy", "clean"] as const;
export type NeedKey = (typeof NEED_KEYS)[number];

export const MAX_CAP_MIN = 720;
export const OFFLINE_FLOOR = 20;
export const PANTRY_MAX = 3;
export const PAT_GAP_MS = 60_000;
export const MAX_VISITS_PER_DAY = 3;
export const FOOD_WALKS_PER_DAY = 3;

export const clamp100 = (n: number) => Math.min(100, Math.max(0, n));

export function freshSim(): Sim {
  return { hunger: 80, fun: 80, energy: 80, clean: 80, asleep: false, story: false };
}

// ---------------------------------------------------------------- dates

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date, `YYYY-MM-DD`. */
export function dateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const keyToDays = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
};

/** Day 1 is the day the pet was planted. */
export function dayNumber(plantedKey: string, ms: number): number {
  return Math.max(1, keyToDays(dateKey(ms)) - keyToDays(plantedKey) + 1);
}

export function formatClock(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(d.getMinutes())} ${h < 12 ? "am" : "pm"}`;
}

// ---------------------------------------------------------------- city clock (D1)

export function windowOfHour(h: number): WindowId {
  if (h >= 6 && h <= 9) return "kaapi";
  if (h >= 10 && h <= 16) return "day";
  if (h >= 17 && h <= 20) return "traffic";
  return "night";
}

export const windowAt = (ms: number): WindowId => windowOfHour(new Date(ms).getHours());

export const TRAFFIC_FACTOR: Record<WindowId, number> = { kaapi: 0.8, day: 1, traffic: 1.3, night: 0 };

const NEXT_ASK: Record<WindowId, string> = { kaapi: "10 am", day: "5 pm", traffic: "9 pm", night: "6 am" };

export const askKey = (ms: number) => `${dateKey(ms)}:${windowAt(ms)}`;

/** Answer the pet's ask. Pays once per window per local date; the area's favourite window pays double. */
export function answerAsk(
  sim: Sim,
  area: Area,
  asks: string[],
  now: number,
  name: string
): { ok: boolean; sim: Sim; asks: string[]; line: string } {
  const C = copyFor(name);
  const w = windowAt(now);
  const key = askKey(now);
  if (asks.includes(key)) {
    return { ok: false, sim, asks, line: `${C.MSG.askDone} Next ask at ${NEXT_ASK[w]}.` };
  }
  if (sim.asleep) return { ok: false, sim, asks, line: C.MSG.asleepShh };
  const m = AREA_INFO[area].window === w ? 2 : 1;
  const next = { ...sim };
  let line = "";
  if (w === "kaapi") {
    next.hunger = clamp100(next.hunger + 10 * m);
    next.energy = clamp100(next.energy + 20 * m);
    line = C.ASK_LINES.kaapi;
  } else if (w === "day") {
    next.energy = clamp100(next.energy + 10 * m);
    next.clean = clamp100(next.clean + 5 * m);
    line = C.ASK_LINES.day;
  } else if (w === "traffic") {
    next.fun = clamp100(next.fun + 20 * m);
    line = C.ASK_LINES.traffic;
  } else {
    next.asleep = true;
    next.story = true;
    line = C.ASK_LINES.night;
  }
  return { ok: true, sim: next, asks: [...asks, key], line };
}

export const askText = (now: number) => ASK_TEXT[windowAt(now)];

// ---------------------------------------------------------------- mood, score, status

export function moodOf(sim: Sim): Mood {
  const avg = (sim.hunger + sim.fun + sim.energy + sim.clean) / 4;
  if (sim.asleep || sim.energy < 25) return "sleepy";
  if (sim.hunger < 25) return "hungry";
  if (sim.fun < 25 || sim.clean < 25 || avg < 40) return "sad";
  if (avg >= 70 && Math.min(sim.hunger, sim.fun, sim.energy, sim.clean) >= 50) return "happy";
  return "idle";
}

export const careScore = (sim: Sim) => Math.round((sim.hunger + sim.fun + sim.energy + sim.clean) / 4);

export function lowestNeed(sim: Sim): NeedKey {
  let low: NeedKey = "hunger";
  for (const k of NEED_KEYS) if (sim[k] < sim[low]) low = k;
  return low;
}

export function statusLine(sim: Sim, name: string): string {
  const { STATUS } = copyFor(name);
  if (sim.asleep) return STATUS.asleep;
  const mood = moodOf(sim);
  if (mood !== "sad") return STATUS[mood];
  const low = lowestNeed(sim);
  if (low === "fun") return STATUS.sadFun;
  if (low === "clean") return STATUS.sadClean;
  return STATUS.sadAverage;
}

// ---------------------------------------------------------------- grille

/** 5 x 5, columns Belly, Fun, Energy, Clean, Today. Lights fill from the bottom. */
export function grilleMask(sim: Sim, actionsToday: number): number {
  const levels = [sim.hunger, sim.fun, sim.energy, sim.clean].map((v) => (v <= 0 ? 0 : Math.ceil(v / 20)));
  levels.push(Math.max(0, Math.min(5, actionsToday)));
  let mask = 0;
  levels.forEach((lit, col) => {
    for (let k = 0; k < Math.min(5, lit); k++) mask |= 1 << ((4 - k) * 5 + col);
  });
  return mask >>> 0;
}

// ---------------------------------------------------------------- time passing (C)

export type SimReport = { sim: Sim; sleptMin: number; woke: boolean; fellAsleep: boolean };

/** Run `minutes` one at a time from `fromMs`, using each minute's local hour. */
export function simulate(start: Sim, fromMs: number, minutes: number, offline: boolean): SimReport {
  const s = { ...start };
  let sleptMin = 0;
  let woke = false;
  let fellAsleep = false;
  const down = (v: number, d: number) => {
    const next = v - d;
    return offline ? Math.max(next, Math.min(v, OFFLINE_FLOOR)) : next;
  };
  for (let i = 1; i <= minutes; i++) {
    const hour = new Date(fromMs + i * 60_000).getHours();
    if (s.asleep) {
      s.hunger = clamp100(down(s.hunger, 0.05));
      s.energy = clamp100(s.energy + (s.story ? 0.75 : 0.5));
      s.clean = clamp100(down(s.clean, 0.05));
      sleptMin++;
    } else {
      s.hunger = clamp100(down(s.hunger, 0.1));
      s.fun = clamp100(down(s.fun, 0.12));
      s.energy = clamp100(down(s.energy, 0.08));
      s.clean = clamp100(down(s.clean, 0.05));
    }
    if (!s.asleep && s.energy <= 10) {
      s.asleep = true;
      fellAsleep = true;
    } else if (!s.asleep && hour === 23 && s.energy < 60) {
      s.asleep = true;
      fellAsleep = true;
    } else if (s.asleep && s.energy >= 100 && hour >= 6 && hour <= 22) {
      s.asleep = false;
      s.story = false;
      woke = true;
    }
  }
  return { sim: s, sleptMin, woke, fellAsleep };
}

export type CatchUp = {
  sim: Sim;
  elapsedMin: number;
  gapMin: number;
  sleptMin: number;
  woke: boolean;
  welcomeBack: boolean;
  lines: string[];
};

/** Offline catch-up: elapsed is clamped to [0, 720] minutes; offline decay stops at 20. */
export function catchUp(sim: Sim, lastSeen: number, now: number, name: string): CatchUp {
  const C = copyFor(name);
  const gapMin = (now - lastSeen) / 60_000;
  const elapsedMin = Math.floor(Math.min(MAX_CAP_MIN, Math.max(0, gapMin)));
  const wasAsleep = sim.asleep;
  const r = simulate(sim, lastSeen, elapsedMin, true);
  let next = r.sim;
  const lines: string[] = [];
  if (r.woke) lines.push(C.MSG.slept);
  else if (next.asleep && wasAsleep) lines.push(C.MSG.stillAsleep);
  const welcomeBack = gapMin >= 360;
  if (welcomeBack) {
    next = { ...next, fun: clamp100(next.fun + 10) };
    lines.push(C.MSG.welcomeBack);
  }
  return { sim: next, elapsedMin, gapMin, sleptMin: r.sleptMin, woke: r.woke, welcomeBack, lines };
}

/** The "While you were away" line. Empty for short gaps. */
export function awayLine(c: Pick<CatchUp, "gapMin" | "sleptMin">, name: string): string {
  if (c.gapMin < 10) return "";
  const h = Math.round(c.sleptMin / 60);
  const slept = h >= 1 ? `slept ${h} hour${h === 1 ? "" : "s"}` : "stayed awake";
  const base = `While you were away: ${name} ate nothing, ${slept} and watched the road.`;
  return c.gapMin >= 720 ? `${base} ${copyFor(name).MSG.waited}` : base;
}

// ---------------------------------------------------------------- food, pat, bath, sleep

export function tasteOf(area: Area, food: Food): Taste {
  const info = AREA_INFO[area];
  if (food === info.favourite) return "favourite";
  if (food === info.dislike) return "dislike";
  return "okay";
}

export function neutralFood(area: Area): Food {
  return AREA_INFO[area].neutral;
}

export const reactionFor = (taste: Taste, name: string) => copyFor(name).REACT[taste];

export type FeedResult =
  | { ok: true; sim: Sim; line: string; usedItem: boolean }
  | { ok: false; sim: Sim; line: string };

/** Feed idli (never runs out) or a pantry item. Refused at hunger 95 or more. */
export function feed(sim: Sim, food: FoodOrIdli, area: Area, name: string): FeedResult {
  const C = copyFor(name);
  if (sim.hunger >= 95) return { ok: false, sim, line: C.MSG.tooFull };
  const s = { ...sim };
  if (food === "idli") {
    s.hunger = clamp100(s.hunger + 25);
    return { ok: true, sim: s, line: C.REACT.idli, usedItem: false };
  }
  const taste = tasteOf(area, food);
  s.hunger = clamp100(s.hunger + (taste === "favourite" ? 35 : taste === "dislike" ? 20 : 30));
  if (taste === "dislike") s.fun = clamp100(s.fun - 5);
  if (food === "kaapi") s.energy = clamp100(s.energy + 10);
  return { ok: true, sim: s, line: C.REACT[taste], usedItem: true };
}

export function pat(sim: Sim, lastPat: number, now: number, name: string): { ok: boolean; sim: Sim; line: string } {
  const C = copyFor(name);
  if (now - lastPat < PAT_GAP_MS) return { ok: false, sim, line: C.STATUS.happy };
  return { ok: true, sim: { ...sim, fun: clamp100(sim.fun + 2) }, line: C.REACT.pat };
}

/** Clean after `mugs` of three. Each mug adds a third of the gap that was there at the start. */
export function bathClean(startClean: number, mugs: number): number {
  const m = Math.max(0, Math.min(3, mugs));
  return m >= 3 ? 100 : clamp100(startClean + ((100 - startClean) * m) / 3);
}

/** Pour mug number `mug` (1 to 3). The first mug takes fun -5. */
export function pourMug(sim: Sim, startClean: number, mug: number): Sim {
  return {
    ...sim,
    clean: bathClean(startClean, mug),
    fun: mug === 1 ? clamp100(sim.fun - 5) : sim.fun,
  };
}

export function canBathe(sim: Sim): { ok: boolean; line: string } {
  return sim.clean >= 90 ? { ok: false, line: MSG.alreadyClean } : { ok: true, line: "" };
}

export function putToSleep(sim: Sim, now: number, name: string): { ok: boolean; sim: Sim; line: string } {
  const C = copyFor(name);
  if (sim.energy >= 80 && windowAt(now) !== "night") return { ok: false, sim, line: C.MSG.notSleepy };
  return { ok: true, sim: { ...sim, asleep: true, story: false }, line: C.STATUS.asleep };
}

export function wakeUp(sim: Sim, name: string): { sim: Sim; line: string } {
  const C = copyFor(name);
  return { sim: { ...sim, asleep: false, story: false }, line: sim.energy < 100 ? C.REACT.wokeEarly : C.STATUS.idle };
}

// ---------------------------------------------------------------- pantry

export function addFood(pantry: Food[], food: Food): { ok: boolean; pantry: Food[] } {
  if (pantry.length >= PANTRY_MAX) return { ok: false, pantry };
  return { ok: true, pantry: [...pantry, food] };
}

export function removeFood(pantry: Food[], index: number): Food[] {
  return pantry.filter((_, i) => i !== index);
}

// ---------------------------------------------------------------- walk (D2)

export function starsFor(seconds: number): 0 | 1 | 2 | 3 {
  if (seconds <= 12) return 3;
  if (seconds <= 25) return 2;
  if (seconds <= 45) return 1;
  return 0;
}

export function walkGate(
  sim: Sim,
  pantry: Food[],
  now: number,
  name: string
): { state: "ok" | "blocked" | "pantry-full"; line: string } {
  const C = copyFor(name);
  if (windowAt(now) === "night") return { state: "blocked", line: C.MSG.walkNight };
  if (sim.energy < 20) return { state: "blocked", line: C.MSG.tooTired };
  if (pantry.length >= PANTRY_MAX) return { state: "pantry-full", line: C.MSG.pantryFull };
  return { state: "ok", line: "" };
}

export type WalkReward = { sim: Sim; food: Food | null; pantry: Food[]; foodLine: string };

/** `walksBefore` is how many walks were already done today. Stars 0 is a timeout. */
export function walkReward(
  sim: Sim,
  stars: number,
  walksBefore: number,
  area: Area,
  pantry: Food[],
  name: string
): WalkReward {
  const s = { ...sim };
  if (stars <= 0) {
    s.fun = clamp100(s.fun + 5);
    s.energy = clamp100(s.energy - 5);
    return { sim: s, food: null, pantry, foodLine: copyFor(name).MSG.timeout };
  }
  s.fun = clamp100(s.fun + 15 + 5 * stars);
  s.energy = clamp100(s.energy - 10);
  s.clean = clamp100(s.clean - 10);
  if (walksBefore >= FOOD_WALKS_PER_DAY) return { sim: s, food: null, pantry, foodLine: "" };
  const food = stars >= 3 ? AREA_INFO[area].favourite : neutralFood(area);
  const added = addFood(pantry, food);
  return { sim: s, food: added.ok ? food : null, pantry: added.pantry, foodLine: "" };
}

/** Back to the median if the pet had passed it, else to the kerb. Rows: 0 kerb, 1-2 lanes, 3 median, 4-5 lanes, 6 darshini. */
export const rowAfterHit = (row: number) => (row > 3 ? 3 : 0);

export const isLaneRow = (row: number) => row === 1 || row === 2 || row === 4 || row === 5;

export type Lane = { id: string; sprite: string; len: number; speed: number; dir: 1 | -1 };

/** L1 scooters and L2 autos run right to left; L3 buses and L4 cars run left to right. */
export const LANES: Lane[] = [
  { id: "L1", sprite: "scooter", len: 32, speed: 90, dir: -1 },
  { id: "L2", sprite: "auto", len: 32, speed: 60, dir: -1 },
  { id: "L3", sprite: "bus", len: 64, speed: 40, dir: 1 },
  { id: "L4", sprite: "car", len: 32, speed: 110, dir: 1 },
];

/** Lane for a row: rows 1, 2, 4, 5 map to L1 to L4. */
export const laneForRow = (row: number): number => (row === 1 ? 0 : row === 2 ? 1 : row === 4 ? 2 : 3);

export const WORLD_W = 320;
export const PET_X0 = WORLD_W / 2 - 12;
export const PET_X1 = WORLD_W / 2 + 12;

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The seed is the local date and the walk count. */
export const walkSeed = (date: string, walkCount: number) => hashSeed(`${date}#${walkCount}`);

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VEHICLES_PER_LANE = 8;

/** Gaps between vehicles, uniform from 70 to 140u. */
export function laneGaps(seed: number, lane: number): number[] {
  const rand = mulberry(seed + lane * 7919);
  return Array.from({ length: VEHICLES_PER_LANE }, () => 70 + rand() * 70);
}

/** Lane speed in u/s, after the time-of-day factor and the Traffic: slow option. */
export function laneSpeed(lane: number, win: WindowId, slow: boolean): number {
  return LANES[lane].speed * TRAFFIC_FACTOR[win] * (slow ? 0.6 : 1);
}

export type Vehicle = { x: number; len: number };

export function vehiclesAt(seed: number, lane: number, seconds: number, win: WindowId, slow: boolean): Vehicle[] {
  const spec = LANES[lane];
  const gaps = laneGaps(seed, lane);
  const period = gaps.reduce((sum, g) => sum + g + spec.len, 0);
  const travel = laneSpeed(lane, win, slow) * seconds * spec.dir;
  let offset = 0;
  return gaps.map((g) => {
    const pos = (((offset + travel) % period) + period) % period;
    offset += g + spec.len;
    return { x: pos - spec.len, len: spec.len };
  });
}

export const hitsPet = (vehicles: Vehicle[]) => vehicles.some((v) => v.x < PET_X1 && v.x + v.len > PET_X0);

// ---------------------------------------------------------------- decor (D3)

export type UnlockCtx = { day: number; totalWalks: number; has3Star: boolean; rainSeen: boolean };

export function unlockedDecor(ctx: UnlockCtx): DecorId[] {
  const out: DecorId[] = ["tulsi"];
  if (ctx.day >= 2) out.push("matka");
  if (ctx.totalWalks >= 5) out.push("rangoli");
  if (ctx.has3Star) out.push("radio");
  if (ctx.day >= 7) out.push("bulbs");
  if (ctx.rainSeen) out.push("umbrella");
  return out;
}

/** Items that fit a slot (0 rail, 1 left floor, 2 right floor), in menu order. */
export const decorForSlot = (slot: number) => DECOR.filter((d) => d.slot === (slot === 0 ? "rail" : "floor"));

export function placeLine(name: string, slot: number): string {
  const where = slot === 0 ? "on the rail" : slot === 1 ? "on the left" : "on the right";
  return `${name} ${where}. Looks like home.`;
}

// ---------------------------------------------------------------- first rain (D5)

export function shouldRain(day: number, now: number, rainSeen: boolean): boolean {
  if (rainSeen || day < 3) return false;
  if (day >= 5) return true;
  const h = new Date(now).getHours();
  return h >= 15 && h <= 20;
}

export function rainEffect(sim: Sim, choice: "umbrella" | "wet"): Sim {
  return choice === "umbrella"
    ? { ...sim, fun: clamp100(sim.fun + 15) }
    : { ...sim, fun: clamp100(sim.fun + 30), clean: clamp100(sim.clean - 20) };
}

// ---------------------------------------------------------------- visit codes (D4)

export const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
/** v2 adds the species; the salt shrinks to 4 bits to make room. */
export const CODE_VERSION = 2;

export type CodeFields = {
  species: Species;
  area: Area;
  mood: Mood;
  day: number;
  decor: [number, number, number];
  rainSeen: boolean;
  rainWet: boolean;
  salt: number;
};

export function crc8(bytes: number[]): number {
  let crc = 0;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
  }
  return crc;
}

function toBits(fields: CodeFields): number[] {
  const bits: number[] = [];
  const push = (value: number, width: number) => {
    for (let i = width - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };
  push(CODE_VERSION, 2);
  push(SPECIES.indexOf(fields.species), 2);
  push(AREAS.indexOf(fields.area), 2);
  push(MOODS.indexOf(fields.mood), 3);
  push(Math.min(255, Math.max(0, fields.day)), 8);
  fields.decor.forEach((d) => push(d & 7, 3));
  push(fields.rainSeen ? 1 : 0, 1);
  push(fields.rainWet ? 1 : 0, 1);
  push(fields.salt & 15, 4);
  return bits;
}

function bitsToBytes(bits: number[]): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i + j] ?? 0);
    bytes.push(b);
  }
  return bytes;
}

/** 8 Crockford base32 characters: 32 data bits plus a CRC-8 of them. Not formatted. */
export function encodeCode(fields: CodeFields): string {
  const bits = toBits(fields);
  const crc = crc8(bitsToBytes(bits));
  for (let i = 7; i >= 0; i--) bits.push((crc >> i) & 1);
  let out = "";
  for (let i = 0; i < 40; i += 5) {
    let v = 0;
    for (let j = 0; j < 5; j++) v = (v << 1) | bits[i + j];
    out += CODE_ALPHABET[v];
  }
  return out;
}

export const formatCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4, 8)}`;

/** Upper-case and drop dashes and spaces. */
export const normalizeCode = (input: string) => input.toUpperCase().replace(/[\s-]/g, "");

export type DecodeResult =
  | { ok: true; code: string; fields: CodeFields }
  | { ok: false; reason: "short" | "bad"; missing: number };

export function decodeCode(input: string): DecodeResult {
  const code = normalizeCode(input);
  if (code.length < 8) return { ok: false, reason: "short", missing: 8 - code.length };
  if (code.length > 8) return { ok: false, reason: "bad", missing: 0 };
  const bits: number[] = [];
  for (const ch of code) {
    const v = CODE_ALPHABET.indexOf(ch);
    if (v < 0) return { ok: false, reason: "bad", missing: 0 };
    for (let i = 4; i >= 0; i--) bits.push((v >> i) & 1);
  }
  const data = bits.slice(0, 32);
  let crc = 0;
  for (let i = 32; i < 40; i++) crc = (crc << 1) | bits[i];
  if (crc8(bitsToBytes(data)) !== crc) return { ok: false, reason: "bad", missing: 0 };
  let pos = 0;
  const take = (w: number) => {
    let v = 0;
    for (let i = 0; i < w; i++) v = (v << 1) | data[pos++];
    return v;
  };
  const version = take(2);
  const species = take(2);
  const area = take(2);
  const mood = take(3);
  const day = take(8);
  const decor: [number, number, number] = [take(3), take(3), take(3)];
  const rainSeen = take(1) === 1;
  const rainWet = take(1) === 1;
  const salt = take(4);
  if (version !== CODE_VERSION || species >= SPECIES.length || area >= AREAS.length || mood >= MOODS.length) {
    return { ok: false, reason: "bad", missing: 0 };
  }
  return {
    ok: true,
    code,
    fields: { species: SPECIES[species], area: AREAS[area], mood: MOODS[mood], day, decor, rainSeen, rainWet, salt },
  };
}

export type VisitLog = { date: string; codes: string[] };

export const visitsToday = (log: VisitLog, now: number): string[] => (log.date === dateKey(now) ? log.codes : []);

export type VisitCheck = { ok: true; code: string; fields: CodeFields } | { ok: false; line: string };

export function checkVisit(input: string, ownCodes: string[], log: VisitLog, now: number): VisitCheck {
  const d = decodeCode(input);
  if (!d.ok) {
    if (d.reason === "short") return { ok: false, line: `Codes have 8 letters. ${d.missing} to go.` };
    return { ok: false, line: MSG.badCode };
  }
  if (ownCodes.map(normalizeCode).includes(d.code)) return { ok: false, line: MSG.ownCode };
  const today = visitsToday(log, now);
  if (today.includes(d.code)) return { ok: false, line: MSG.sameCode };
  if (today.length >= MAX_VISITS_PER_DAY) return { ok: false, line: MSG.visitLimit };
  return { ok: true, code: d.code, fields: d.fields };
}

export function logVisit(log: VisitLog, code: string, now: number): VisitLog {
  return { date: dateKey(now), codes: [...visitsToday(log, now), code] };
}

export type Visitor = { area: Area; species: Species; code: string; date: string };

/** Visitors leave at local midnight. */
export const visitorPresent = (v: Visitor | null, now: number): v is Visitor => !!v && v.date === dateKey(now);

/** The visitor brings their own area's favourite food. The host reacts by its own taste. */
export function visitGift(
  visitorArea: Area,
  hostArea: Area,
  pantry: Food[],
  name: string
): { food: Food; gifted: boolean; pantry: Food[]; line: string } {
  const food = AREA_INFO[visitorArea].favourite;
  const added = addFood(pantry, food);
  if (!added.ok) return { food, gifted: false, pantry, line: copyFor(name).MSG.giftNoRoom };
  return { food, gifted: true, pantry: added.pantry, line: reactionFor(tasteOf(hostArea, food), name) };
}

export const applyVisit = (sim: Sim): Sim => ({ ...sim, fun: clamp100(sim.fun + 20) });

/** The postcard box keeps the last 10 codes. */
export const pushBox = (box: string[], code: string): string[] => [...box, code].slice(-10);

// ---------------------------------------------------------------- share

export function shareText(day: number, area: Area, percent: number, code: string, name: string, species: Species): string {
  const noun = SPECIES_INFO[species].noun;
  return `Day ${day} with ${name} the ${noun} in ${area}, ${percent}% looked after. Visit code ${code}`;
}
