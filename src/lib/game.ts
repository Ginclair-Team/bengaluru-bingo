import tilesJson from "@/data/tiles.json";

export type CategoryId = "food" | "commute" | "outdoors" | "hustle" | "scene";

export type Tile = {
  id: string;
  /** On-tile label (7 characters or fewer). */
  short: string;
  top: string;
  bottom: string;
  name: string;
  category: CategoryId;
  blurb: string;
};

export const GRID = 5;
export const TILE_COUNT = GRID * GRID;
export const TILES = tilesJson as Tile[];

export const CATEGORIES: Record<CategoryId, { label: string; badge: string; color: string }> = {
  food: { label: "Tiffin", badge: "Foodie", color: "#E9B949" },
  commute: { label: "Commute", badge: "Jam Survivor", color: "#D9824F" },
  outdoors: { label: "Outdoors", badge: "Park Walker", color: "#A7B27C" },
  hustle: { label: "Hustle", badge: "Tech Guru", color: "#CDAE8E" },
  scene: { label: "Scene", badge: "Quiz Captain", color: "#F28C78" },
};

/** Scorecard frame colour when nothing is stamped (cat-none). */
export const NONE_COLOR = "#F6E3C8";

export const CATEGORY_ORDER: CategoryId[] = ["food", "commute", "outdoors", "hustle", "scene"];

/** A card is 25 yes/no answers, so it fits in one number. */
export type Marks = number;

export function isMarked(marks: Marks, index: number): boolean {
  return (marks & (1 << index)) !== 0;
}

export function toggleMark(marks: Marks, index: number): Marks {
  return (marks ^ (1 << index)) >>> 0;
}

export function countMarks(marks: Marks): number {
  let n = 0;
  for (let i = 0; i < TILE_COUNT; i++) if (isMarked(marks, i)) n++;
  return n;
}

/** Share code: the marks as five base-36 characters. No personal data in it. */
export function encodeMarks(marks: Marks): string {
  return marks.toString(36).padStart(5, "0");
}

export function decodeMarks(code: string): Marks | null {
  if (!/^[0-9a-z]{1,5}$/.test(code)) return null;
  const value = parseInt(code, 36);
  if (!Number.isFinite(value) || value < 0 || value >= 2 ** TILE_COUNT) return null;
  return value;
}

const LINES: number[][] = (() => {
  const lines: number[][] = [];
  for (let r = 0; r < GRID; r++) lines.push(Array.from({ length: GRID }, (_, c) => r * GRID + c));
  for (let c = 0; c < GRID; c++) lines.push(Array.from({ length: GRID }, (_, r) => r * GRID + c));
  lines.push(Array.from({ length: GRID }, (_, i) => i * GRID + i));
  lines.push(Array.from({ length: GRID }, (_, i) => i * GRID + (GRID - 1 - i)));
  return lines;
})();

export function bingoLines(marks: Marks): number[][] {
  return LINES.filter((line) => line.every((i) => isMarked(marks, i)));
}

export type Tier = { stars: 1 | 2 | 3 | 4; label: string };

export function tierFor(percent: number): Tier {
  if (percent >= 80) return { stars: 4, label: "Namma legend" };
  if (percent >= 50) return { stars: 3, label: "Pakka local" };
  if (percent >= 25) return { stars: 2, label: "Settling in" };
  return { stars: 1, label: "Just landed" };
}

export type Score = {
  code: string;
  marked: number;
  percent: number;
  lines: number;
  tier: Tier;
  /** The category the player has stamped most; null on an empty card. */
  top: CategoryId | null;
  badge: string;
  byCategory: Record<CategoryId, number>;
};

export function scoreFor(marks: Marks): Score {
  const byCategory: Record<CategoryId, number> = { food: 0, commute: 0, outdoors: 0, hustle: 0, scene: 0 };
  TILES.forEach((tile, i) => {
    if (isMarked(marks, i)) byCategory[tile.category]++;
  });
  const marked = countMarks(marks);
  const percent = Math.round((marked / TILE_COUNT) * 100);
  let top: CategoryId | null = null;
  for (const id of CATEGORY_ORDER) {
    if (byCategory[id] > 0 && (top === null || byCategory[id] > byCategory[top])) top = id;
  }
  return {
    code: encodeMarks(marks),
    marked,
    percent,
    lines: bingoLines(marks).length,
    tier: tierFor(percent),
    top,
    badge: top ? CATEGORIES[top].badge : "New Arrival",
    byCategory,
  };
}

export type Journey = {
  both: number[];
  onlyA: number[];
  onlyB: number[];
  neither: number[];
};

/** Card clubbing: how two cards overlap, as tile indexes. */
export function journeyFor(a: Marks, b: Marks): Journey {
  const j: Journey = { both: [], onlyA: [], onlyB: [], neither: [] };
  for (let i = 0; i < TILE_COUNT; i++) {
    const inA = isMarked(a, i);
    const inB = isMarked(b, i);
    if (inA && inB) j.both.push(i);
    else if (inA) j.onlyA.push(i);
    else if (inB) j.onlyB.push(i);
    else j.neither.push(i);
  }
  return j;
}
