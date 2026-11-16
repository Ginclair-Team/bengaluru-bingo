import type { CategoryId } from "@/lib/game";
import { spriteSvg, type Sprite } from "@/lib/pixel";

// 8x8 one-colour category glyphs (DESIGN.md section 8). `#` is a lit pixel;
// they are drawn in currentColor, so CSS decides the colour.

const px = (rows: string[]): Sprite => rows.map((r) => r.replace(/#/g, "K"));

export const CATEGORY_GLYPHS: Record<CategoryId, Sprite> = {
  // Bowl with two steam pixels.
  food: px([
    "........",
    "..#..#..",
    "........",
    "########",
    ".######.",
    ".######.",
    "..####..",
    "...##...",
  ]),
  // Wheel: 6px ring, 2px hub.
  commute: px([
    "........",
    "..####..",
    ".##..##.",
    ".#.##.#.",
    ".#.##.#.",
    ".##..##.",
    "..####..",
    "........",
  ]),
  // Leaf with a diagonal vein gap.
  outdoors: px([
    ".....###",
    "...#####",
    "..###.##",
    ".###.###",
    ".##.###.",
    ".#.###..",
    "#.#.....",
    "#.......",
  ]),
  // Lightning bolt, 3px wide, two steps.
  hustle: px([
    "...###..",
    "..###...",
    ".###....",
    ".######.",
    "....###.",
    "...###..",
    "..###...",
    "..##....",
  ]),
  // Cocktail glass.
  scene: px([
    "########",
    ".######.",
    "..####..",
    "...##...",
    "...##...",
    "...##...",
    ".######.",
    "........",
  ]),
};

/** 5-point pixel star, shared by the star icon and the scorecard. */
export const STAR_SPRITE: Sprite = px([
  "...##...",
  "...##...",
  "########",
  ".######.",
  "..####..",
  ".##..##.",
  ".#....#.",
  "........",
]);

export function categoryGlyphSvg(id: CategoryId, opts: { className?: string } = {}): string {
  return spriteSvg(CATEGORY_GLYPHS[id], { mono: true, className: opts.className });
}
