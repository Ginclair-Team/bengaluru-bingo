import { ZONES, type Zone } from "./data";

export const STORAGE_KEY = "wsm:v1";

export type Stats = {
  runs: number;
  rounds: number;
  correct: number;
  byZone: Record<Zone, { seen: number; correct: number }>;
};

export function defaultStats(): Stats {
  const byZone = {} as Stats["byZone"];
  for (const z of ZONES) byZone[z] = { seen: 0, correct: 0 };
  return { runs: 0, rounds: 0, correct: 0, byZone };
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

/** Read saved stats. Call from effects and handlers only, never during render. */
export function loadStats(): Stats {
  const fresh = defaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const data = JSON.parse(raw) as Record<string, unknown> | null;
    if (!data || typeof data !== "object") return fresh;
    const by = (data.byZone ?? {}) as Record<string, { seen?: unknown; correct?: unknown } | undefined>;
    for (const z of ZONES) {
      fresh.byZone[z] = { seen: num(by[z]?.seen), correct: num(by[z]?.correct) };
    }
    fresh.runs = num(data.runs);
    fresh.rounds = num(data.rounds);
    fresh.correct = num(data.correct);
    return fresh;
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage is blocked or full: play on without saving.
  }
}
