import { LANDMARKS, ZONES, type Landmark, type Zone } from "./data";
import {
  NO_ZONE,
  RESULT_GOOD,
  RESULT_LOW,
  RESULT_PERFECT,
  RESULT_ZERO,
  SHARE_TEMPLATE,
} from "./copy";

export type ZoneStats = Record<Zone, { seen: number; correct: number }>;

export function pickRounds(rand: () => number = Math.random, n = 5): Landmark[] {
  const pool = [...LANDMARKS];
  const out: Landmark[] = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const j = Math.min(pool.length - 1, Math.floor(rand() * pool.length));
    out.push(pool.splice(j, 1)[0]);
  }
  return out;
}

export function zoneLabel(zone: Zone): string {
  return zone;
}

export function headlineFor(score: number): string {
  if (score >= 5) return RESULT_PERFECT;
  if (score >= 3) return RESULT_GOOD;
  if (score >= 1) return RESULT_LOW;
  return RESULT_ZERO;
}

export function shareText(score: number, zone: Zone | null): string {
  return SHARE_TEMPLATE.replace("{score}", String(score)).replace("{zone}", zone ? zoneLabel(zone) : NO_ZONE);
}

/** The zone with the most correct guesses; ties go to the earlier zone. Null if none. */
export function favoriteZone(stats: { byZone: ZoneStats }): Zone | null {
  let best: Zone | null = null;
  let top = 0;
  for (const z of ZONES) {
    const c = stats.byZone[z]?.correct ?? 0;
    if (c > top) {
      top = c;
      best = z;
    }
  }
  return best;
}

/** 5 holes per correct answer, filled from bit 0 upward. */
export function gridMaskForCorrect(correct: number): number {
  const holes = Math.max(0, Math.min(5, Math.floor(correct))) * 5;
  return holes === 0 ? 0 : 2 ** holes - 1;
}
