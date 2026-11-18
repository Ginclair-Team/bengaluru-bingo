import { CATEGORIES, CATEGORY_ORDER, NONE_COLOR, decodeMarks, type Score } from "@/games/bingo/rules";
import { spriteRects } from "@/lib/pixel";
import { avatarRects } from "./avatars";
import { CATEGORY_GLYPHS, STAR_SPRITE } from "./glyphs";

// The scorecard as one self-contained SVG string: a pixel trading card
// (DESIGN.md section 9). The page injects it inline; /api/scorecard/[code]
// serves the same markup as an image, so both always match. Everything is
// rects on a 4px grid (the stats glyphs are 3x, per the spec), no strokes.

export const CARD_W = 500;
export const CARD_H = 700;

export type ScorecardFonts = { display: string; label: string; body: string };

/** Fonts for a standalone SVG file, where the page's CSS variables don't exist. */
export const STANDALONE_FONTS: ScorecardFonts = {
  display: "'Press Start 2P', 'Courier New', monospace",
  label: "'Silkscreen', 'Courier New', monospace",
  body: "'Pixelify Sans', 'Trebuchet MS', sans-serif",
};

const INK = "#2E1F18";
const PAPER = "#F4E6CF";
const STAMPED = "#F6B09B";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const r = (x: number, y: number, w: number, h: number, fill: string, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;

/** A rectangle with two stepped (not rounded) corners: cut `c` px in two steps. */
function stepped(x: number, y: number, w: number, h: number, c: number, fill: string): string {
  const s = c / 2;
  const x2 = x + w;
  const y2 = y + h;
  const d =
    `M${x + c} ${y}H${x2 - c}V${y + s}H${x2 - s}V${y + c}H${x2}` +
    `V${y2 - c}H${x2 - s}V${y2 - s}H${x2 - c}V${y2}H${x + c}` +
    `V${y2 - s}H${x + s}V${y2 - c}H${x}V${y + c}H${x + s}V${y + s}H${x + c}Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

/** Press Start 2P text: one em per character, so the natural width is known. */
function pressStart(
  fonts: ScorecardFonts,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  opts: { anchor?: "start" | "middle"; maxWidth?: number } = {}
): string {
  const natural = text.length * size;
  const len = Math.min(natural, opts.maxWidth ?? natural);
  const anchor = opts.anchor ?? "start";
  return (
    `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}" textLength="${len}" lengthAdjust="spacingAndGlyphs"` +
    ` style="font-family:${fonts.display};font-size:${size}px">${esc(text)}</text>`
  );
}

function label(
  fonts: ScorecardFonts,
  text: string,
  x: number,
  y: number,
  size: number,
  weight: 400 | 700,
  fill = INK,
  anchor: "start" | "middle" = "start"
): string {
  return (
    `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}"` +
    ` style="font-family:${fonts.label};font-size:${size}px;font-weight:${weight}">${esc(text)}</text>`
  );
}

export function scorecardSvg(
  score: Score,
  fonts: ScorecardFonts,
  options: { standalone?: boolean; title?: string } = {}
): string {
  const frame = score.top ? CATEGORIES[score.top].color : NONE_COLOR;
  const title = esc(options.title ?? `I am ${score.percent}% Bengaluru native. Badge: ${score.badge}.`);
  const marks = decodeMarks(score.code) ?? 0;
  const avatar = score.top ?? "none";

  // Body: ink border (8px) then the category fill, both with stepped corners.
  const body = stepped(0, 0, CARD_W, CARD_H, 8, INK) + stepped(8, 8, CARD_W - 16, CARD_H - 16, 8, frame);

  // Holo-sticker edge: 4px white at 60%, inset 16.
  const holo =
    `<g fill="#FFFFFF" fill-opacity="0.6">` +
    `<rect x="20" y="16" width="460" height="4"/><rect x="20" y="680" width="460" height="4"/>` +
    `<rect x="16" y="20" width="4" height="660"/><rect x="480" y="20" width="4" height="660"/>` +
    `</g>`;

  const badge = pressStart(fonts, score.badge.toUpperCase(), 28, 62, 22, INK, { maxWidth: 300 });

  // 1 to 4 stars, 32px (4x), 4px apart, right-aligned to x=472, sitting on y=62.
  const stars = Array.from({ length: score.tier.stars }, (_, i) =>
    spriteRects(STAR_SPRITE, { mono: true, x: 472 - 32 * (i + 1) - 4 * i, y: 30, scale: 4 })
  ).join("");

  // Scene: the avatar at 7px per pixel, inside a 4px ink border.
  const scene = r(22, 80, 456, 316, INK) + avatarRects(avatar, { x: 26, y: 84, scale: 7 });

  // Score plaque overlapping the scene's bottom-right.
  const pct = `${score.percent}%`;
  const plaque =
    stepped(292, 356, 184, 72, 8, INK) +
    stepped(296, 360, 176, 64, 4, STAMPED) +
    stepped(300, 364, 168, 56, 4, INK) +
    pressStart(fonts, pct, 384, 406, score.percent === 100 ? 30 : 36, PAPER, { anchor: "middle" });

  const lines = score.lines === 0 ? "no bingo lines yet" : `${score.lines} bingo line${score.lines === 1 ? "" : "s"}`;
  const heading = label(fonts, "BENGALURU NATIVE", 28, 432, 18, 700);
  const tier =
    `<text x="28" y="462" fill="${INK}" style="font-family:${fonts.body};font-size:17px;font-weight:600">` +
    `${esc(`${score.tier.label}, ${lines}`)}</text>`;

  // Five stat cells: glyph (3x), a white count box, a label.
  const stats = CATEGORY_ORDER.map((id, i) => {
    const x = 28 + i * 92;
    const count = String(score.byCategory[id]);
    return (
      `<g transform="translate(${x} 496)">` +
      spriteRects(CATEGORY_GLYPHS[id], { mono: true, scale: 3 }) +
      r(36, -6, 44, 44, INK) +
      r(40, -2, 36, 36, "#FFFFFF") +
      pressStart(fonts, count, 58, 22, 18, INK, { anchor: "middle" }) +
      label(fonts, CATEGORIES[id].label.toUpperCase(), 0, 68, 12, 400) +
      `</g>`
    );
  }).join("");
  // Glyphs and counts use ink: set it once so mono sprites (currentColor) pick it up.
  const statsGroup = `<g color="${INK}">${stats}</g>`;

  // Divider: 4px ink dashes, 8 on, 4 off.
  let divider = "";
  for (let x = 28; x < 472; x += 12) divider += r(x, 598, Math.min(8, 472 - x), 4, INK);

  const footer =
    label(fonts, "BENGALURU BINGO", 28, 630, 14, 700) +
    label(fonts, "A GINHOUSE GAME BY GINCLAIR", 28, 652, 11, 400) +
    pressStart(fonts, `NO.${score.code.toUpperCase()}`, 28, 678, 14, INK);

  // Stamp map: the card's fingerprint. 5x5 cells of 8px, 2px gaps.
  let map = "";
  for (let i = 0; i < 25; i++) {
    const cx = 424 + (i % 5) * 10;
    const cy = 616 + Math.floor(i / 5) * 10;
    const on = (marks & (1 << i)) !== 0;
    map += on ? r(cx, cy, 8, 8, INK) : r(cx, cy, 8, 8, "#FFFFFF", ` fill-opacity="0.6"`);
  }

  const fontImport = options.standalone
    ? `<style>@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;family=Silkscreen:wght@400;700&amp;family=Pixelify+Sans:wght@400;600&amp;display=swap');</style>`
    : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" shape-rendering="crispEdges" role="img" aria-label="${title}">` +
    `<title>${title}</title>` +
    fontImport +
    body +
    holo +
    badge +
    `<g color="${INK}">${stars}</g>` +
    scene +
    plaque +
    heading +
    tier +
    statsGroup +
    divider +
    footer +
    `<g>${map}</g>` +
    `</svg>`
  );
}
