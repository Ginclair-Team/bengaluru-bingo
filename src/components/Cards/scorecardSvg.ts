import { CATEGORIES, CATEGORY_ORDER, type CategoryId, type Score } from "@/lib/game";
import { SEASONS, type SeasonId } from "@/theme/seasons";
import { avatarScene } from "./avatars";

// The scorecard as one self-contained SVG string, in trading-card format.
// The page injects it inline; /api/scorecard/[code] serves the same markup
// as an image, so both always match.

export const CARD_W = 500;
export const CARD_H = 700;

export type ScorecardFonts = { display: string; mono: string };

/** Fonts for a standalone SVG file, where the page's CSS variables don't exist. */
export const STANDALONE_FONTS: ScorecardFonts = {
  display: "'Dela Gothic One', 'Arial Black', sans-serif",
  mono: "'Martian Mono', ui-monospace, monospace",
};

const GLYPHS: Record<CategoryId, string> = {
  food:
    `<path d="M2 11 H22 Q21 22 12 22 Q3 22 2 11 Z"/>` +
    `<path d="M9 7 Q7 5 9 2 M15 7 Q13 5 15 2" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round"/>`,
  commute: `<path fill-rule="evenodd" d="M12 1 A11 11 0 1 0 12 23 A11 11 0 1 0 12 1 Z M12 8 A4 4 0 1 1 12 16 A4 4 0 1 1 12 8 Z"/>`,
  outdoors: `<path d="M12 1 Q23 8 12 23 Q1 8 12 1 Z"/>`,
  hustle: `<path d="M14 1 L3 13 H10 L8 23 L21 10 H13 Z"/>`,
  scene:
    `<path d="M2 3 H22 L12 14 Z"/>` +
    `<path d="M12 13 V21 M6 21.5 H18" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round"/>`,
};

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + radius * Math.cos(a)).toFixed(1)},${(cy + radius * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="#000"/>`;
}

export function scorecardSvg(
  score: Score,
  season: SeasonId,
  fonts: ScorecardFonts,
  options: { standalone?: boolean; title?: string } = {}
): string {
  const palette = SEASONS[season];
  const frame = score.top ? CATEGORIES[score.top].color : "#FFF4DC";
  const uid = `${score.code}-${options.standalone ? "s" : "i"}`;
  const display = `font-family:${fonts.display}`;
  const mono = `font-family:${fonts.mono};font-stretch:75%`;
  const title = options.title ?? `I am ${score.percent}% Bengaluru native. Badge: ${score.badge}.`;

  const stars = Array.from({ length: score.tier.stars }, (_, i) => star(468 - i * 27, 46, 12)).join("");

  const stats = CATEGORY_ORDER.map((id, i) => {
    const x = 26 + i * 91;
    return (
      `<g transform="translate(${x} 0)">` +
      `<g transform="translate(0 512) scale(1.25)">${GLYPHS[id]}</g>` +
      `<rect x="36" y="506" width="44" height="42" rx="7" fill="#fff" stroke="#000" stroke-width="4"/>` +
      `<text x="58" y="536" text-anchor="middle" style="${display};font-size:22px">${score.byCategory[id]}</text>` +
      `<text x="0" y="572" style="${mono};font-size:11px;font-weight:600;letter-spacing:0.04em">${CATEGORIES[id].label.toUpperCase()}</text>` +
      `</g>`
    );
  }).join("");

  const lines =
    score.lines === 0 ? "no bingo lines yet" : `${score.lines} bingo line${score.lines === 1 ? "" : "s"}`;

  const fontImport = options.standalone
    ? `<style>@import url('https://fonts.googleapis.com/css2?family=Dela+Gothic+One&amp;family=Martian+Mono:wdth,wght@75,400..800&amp;display=swap');</style>`
    : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" role="img" aria-label="${title}">` +
    `<title>${title}</title>` +
    fontImport +
    `<defs><clipPath id="scene-${uid}"><rect x="24" y="78" width="452" height="322" rx="18"/></clipPath></defs>` +
    `<rect x="3" y="3" width="${CARD_W - 6}" height="${CARD_H - 6}" rx="30" fill="${frame}" stroke="#000" stroke-width="6"/>` +
    `<text x="28" y="57" style="${display};font-size:29px">${score.badge.toUpperCase()}</text>` +
    stars +
    `<g clip-path="url(#scene-${uid})">` +
    `<svg x="24" y="78" width="452" height="322" viewBox="0 0 240 176" preserveAspectRatio="xMidYMid slice">` +
    avatarScene(score.top ?? "none", uid) +
    `</svg></g>` +
    `<rect x="24" y="78" width="452" height="322" rx="18" fill="none" stroke="#000" stroke-width="6"/>` +
    `<circle cx="398" cy="394" r="64" fill="#000"/>` +
    `<text x="398" y="410" text-anchor="middle" fill="#FFF4DC" style="${display};font-size:${score.percent === 100 ? 38 : 44}px">${score.percent}%</text>` +
    `<circle cx="54" cy="424" r="13" fill="${palette.accent}" stroke="#000" stroke-width="4"/>` +
    `<text x="78" y="431" style="${mono};font-size:19px;font-weight:800">BENGALURU NATIVE</text>` +
    `<text x="28" y="472" style="${mono};font-size:14px;font-weight:600">${score.tier.label}, ${lines}</text>` +
    stats +
    `<path d="M26 604 H474" stroke="#000" stroke-width="4" stroke-linecap="round"/>` +
    `<text x="28" y="640" style="${mono};font-size:13px;font-weight:800;letter-spacing:0.06em">BENGALURU BINGO</text>` +
    `<text x="28" y="662" style="${mono};font-size:11px;font-weight:600;letter-spacing:0.06em">GINHOUSE'S WORLD, BY GINCLAIR</text>` +
    `<text x="472" y="656" text-anchor="end" style="${display};font-size:22px">NO.${score.code.toUpperCase()}</text>` +
    `</svg>`
  );
}
