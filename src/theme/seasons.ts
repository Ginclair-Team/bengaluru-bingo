// The seasonal palette engine. One source of truth for every colour that
// changes with the calendar; layout.tsx turns this into CSS variables and
// tailwind.config.ts exposes them as bg-board, text-ink and so on.

export type SeasonId = "summer" | "monsoon" | "winter" | "spring";

export type SeasonPalette = {
  id: SeasonId;
  label: string;
  months: string;
  /** Page background. */
  ground: string;
  /** The bingo board itself. */
  board: string;
  /** Lettering printed on the board. */
  boardInk: string;
  /** Tile paper. */
  paper: string;
  /** Labels printed on the tiles. */
  ink: string;
  /** Rubber-stamp ink for marked tiles. */
  stamp: string;
  /** The spec's named dominant, used for small highlights. */
  accent: string;
};

export const SEASONS: Record<SeasonId, SeasonPalette> = {
  // May to August. Spec dominant #FF4757, deepened on the board so cream
  // lettering clears WCAG AA (4.8:1).
  summer: {
    id: "summer",
    label: "Summer",
    months: "May to August",
    ground: "#F3F0E6",
    board: "#D4253A",
    boardInk: "#FFF9C9",
    paper: "#FBD9CF",
    ink: "#9E0F22",
    stamp: "#2B3FD6",
    accent: "#FF4757",
  },
  // September to November. Spec dominant #00B4D8, deepened to teal for the
  // board (5.4:1 against its lettering), rainy grey ground.
  monsoon: {
    id: "monsoon",
    label: "Monsoon",
    months: "September to November",
    ground: "#B7C7D0",
    board: "#086F8A",
    boardInk: "#E9FBFF",
    paper: "#D5F1F7",
    ink: "#064B5E",
    stamp: "#E8344A",
    accent: "#00B4D8",
  },
  // December to February. The spec names Winter but gives it no palette;
  // this one is a proposal awaiting the owner's sign-off.
  winter: {
    id: "winter",
    label: "Winter",
    months: "December to February",
    ground: "#DDD3F0",
    board: "#5B3FA8",
    boardInk: "#FFF4DC",
    paper: "#EFE6FF",
    ink: "#3A2478",
    stamp: "#E8344A",
    accent: "#A56EDB",
  },
  // March and April (shared with Autumn in the spec). Spec dominant #FF9F43
  // with dark lettering, since white on this orange cannot reach AA.
  spring: {
    id: "spring",
    label: "Spring",
    months: "March and April",
    ground: "#F1E4CF",
    board: "#FF9F43",
    boardInk: "#2A1245",
    paper: "#FFF3DC",
    ink: "#7A3E00",
    stamp: "#6A3FD0",
    accent: "#E0A100",
  },
};

export const SEASON_ORDER: SeasonId[] = ["summer", "monsoon", "winter", "spring"];

/** Month is 0-based, as returned by Date.getMonth(). */
export function seasonForMonth(month: number): SeasonId {
  if (month >= 4 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "monsoon";
  if (month === 11 || month <= 1) return "winter";
  return "spring";
}

export function seasonForDate(date: Date): SeasonId {
  return seasonForMonth(date.getMonth());
}

export function isSeasonId(value: unknown): value is SeasonId {
  return typeof value === "string" && value in SEASONS;
}

function vars(p: SeasonPalette): string {
  return `--ground:${p.ground};--board:${p.board};--board-ink:${p.boardInk};--paper:${p.paper};--ink:${p.ink};--stamp:${p.stamp};--accent:${p.accent};`;
}

/** CSS for every season, keyed on <html data-season>. */
export function seasonCss(fallback: SeasonId): string {
  const blocks = SEASON_ORDER.map((id) => `html[data-season="${id}"]{${vars(SEASONS[id])}}`);
  return `:root{${vars(SEASONS[fallback])}}${blocks.join("")}`;
}

export const SEASON_STORAGE_KEY = "bb:season";

/** Runs before first paint so the right palette is there from the start. */
export const seasonBootScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  SEASON_STORAGE_KEY
)});if(!s||!/^(summer|monsoon|winter|spring)$/.test(s)){var m=new Date().getMonth();s=m>=4&&m<=7?"summer":m>=8&&m<=10?"monsoon":(m===11||m<=1)?"winter":"spring";}document.documentElement.setAttribute("data-season",s);}catch(e){}})();`;
