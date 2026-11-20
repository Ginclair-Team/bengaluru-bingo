/** Gig Hunt storage: one localStorage key holding { run, lifetime }. Every access is guarded. */

import { DISTRICTS, LISTINGS, RULES, STORAGE_KEY, TRACKS, type DistrictId } from "./data";
import { freshLifetime, freshSkills, pickBoard, type Lifetime, type Run, type Skills } from "./rules";

export type Stored = { run: Run | null; lifetime: Lifetime };
export type LoadStatus = "ok" | "missing" | "corrupt" | "blocked";

export const freshStored = (): Stored => ({ run: null, lifetime: freshLifetime() });

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const int = (v: unknown, lo: number, hi: number, fallback: number) =>
  isNum(v) ? Math.min(hi, Math.max(lo, Math.floor(v))) : fallback;
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isDistrict = (v: unknown): v is DistrictId => DISTRICTS.some((d) => d.id === v);
const listingIds = (v: unknown): string[] => {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const id of v) if (typeof id === "string" && LISTINGS.some((l) => l.id === id) && !out.includes(id)) out.push(id);
  return out;
};

function skillsOf(v: unknown): Skills {
  const out = freshSkills();
  if (isRecord(v)) for (const t of TRACKS) out[t] = int(v[t], 0, RULES.maxLevel, 0);
  return out;
}

/** A saved run, or null when what came back is not one. */
export function sanitizeRun(raw: unknown): Run | null {
  if (!isRecord(raw) || !isDistrict(raw.home) || !isNum(raw.seed) || !isNum(raw.bank)) return null;
  const seed = Math.floor(raw.seed) >>> 0;
  const day = int(raw.day, 1, RULES.days, 1);
  const offerIds = listingIds(raw.offerIds);
  let board = listingIds(raw.board).filter((id) => !offerIds.includes(id)).slice(0, RULES.boardSize);
  if (board.length === 0) board = pickBoard(seed, day, offerIds);
  const pending = typeof raw.pendingOffer === "string" && offerIds.includes(raw.pendingOffer) ? raw.pendingOffer : null;
  return {
    seed,
    day,
    energy: int(raw.energy, 0, RULES.energyMax, RULES.energyMax),
    bank: Math.max(-1_000_000, Math.min(10_000_000, Math.round(raw.bank))),
    skills: skillsOf(raw.skills),
    home: raw.home,
    board,
    tried: listingIds(raw.tried),
    tiffinReady: raw.tiffinReady === true,
    offerIds,
    pendingOffer: pending,
    interviews: int(raw.interviews, 0, 9999, 0),
    offers: int(raw.offers, 0, 9999, 0),
    bestSalary: int(raw.bestSalary, 0, 10_000_000, 0),
  };
}

export function sanitizeLifetime(raw: unknown): Lifetime {
  const base = freshLifetime();
  if (!isRecord(raw)) return base;
  return {
    sessions: int(raw.sessions, 0, 1_000_000, 0),
    offers: int(raw.offers, 0, 1_000_000, 0),
    bestSalary: int(raw.bestSalary, 0, 10_000_000, 0),
    streakDays: int(raw.streakDays, 0, 100_000, 0),
    lastPlayedOn: isDate(raw.lastPlayedOn) ? raw.lastPlayedOn : "",
  };
}

/** Read the record. Call from effects and handlers only, never during render. */
export function loadStored(): { stored: Stored; status: LoadStatus } {
  let text: string | null;
  try {
    text = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { stored: freshStored(), status: "blocked" };
  }
  if (text === null) return { stored: freshStored(), status: "missing" };
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed)) return { stored: freshStored(), status: "corrupt" };
    return { stored: { run: sanitizeRun(parsed.run), lifetime: sanitizeLifetime(parsed.lifetime) }, status: "ok" };
  } catch {
    return { stored: freshStored(), status: "corrupt" };
  }
}

/** Returns false when the browser would not keep the record. */
export function writeStored(stored: Stored): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
}
