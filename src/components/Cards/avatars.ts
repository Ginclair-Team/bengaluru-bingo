import type { CategoryId } from "@/lib/game";
import { spriteRects, type Sprite } from "@/lib/pixel";
import { TILE_ART } from "@/components/BingoCardIllustrator/art";

// Avatar scenes: 64 x 44 pixel grids (DESIGN.md section 8), shown at 7px per
// pixel on the scorecard. Each scene is composed from layers (sky, ground,
// props, then a character) with a few small drawing helpers, then frozen into
// a Sprite (an array of equal-length strings, one char per pixel).
//
// Composition rule: head and shoulders sit slightly left of centre, the
// horizon is at row 32, and the score plaque covers the bottom-right 26 x 10.

export type AvatarId = CategoryId | "none";

const W = 64;
const H = 44;
type Grid = string[][];

const blank = (ch = "."): Grid => Array.from({ length: H }, () => Array<string>(W).fill(ch));

function px(g: Grid, x: number, y: number, c: string) {
  if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c;
}
function rect(g: Grid, x: number, y: number, w: number, h: number, c: string) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(g, x + i, y + j, c);
}
/** Filled ellipse; (cx, cy) are continuous coordinates (pixel centres at +0.5). */
function ell(g: Grid, cx: number, cy: number, rx: number, ry: number, c: string) {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) g[y][x] = c;
    }
}
/** Filled triangle. */
function tri(g: Grid, a: [number, number], b: [number, number], c: [number, number], ch: string) {
  const sign = (p: [number, number], q: [number, number], r: [number, number]) =>
    (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const p: [number, number] = [x + 0.5, y + 0.5];
      const d1 = sign(p, a, b);
      const d2 = sign(p, b, c);
      const d3 = sign(p, c, a);
      const neg = d1 < 0 || d2 < 0 || d3 < 0;
      const pos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(neg && pos)) g[y][x] = ch;
    }
}
/** A fat line made of discs. */
function thick(g: Grid, x0: number, y0: number, x1: number, y1: number, r: number, c: string) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    ell(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, r, c);
  }
}
function checker(g: Grid, x: number, y: number, w: number, h: number, a: string, b: string) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(g, x + i, y + j, (x + i + y + j) % 2 === 0 ? a : b);
}
function stamp(g: Grid, src: Sprite, ox: number, oy: number) {
  src.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) if (row[i] !== ".") px(g, ox + i, oy + j, row[i]);
  });
}
/** Composite `top` over `base`; "." in `top` is transparent. */
function over(base: Grid, top: Grid) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (top[y][x] !== ".") base[y][x] = top[y][x];
}
/** 1px shadow on the right/bottom edge of every `fill` pixel. */
function shade(t: Grid, fill: string, shadow: string) {
  const src = t.map((r) => r.slice());
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (src[y][x] !== fill) continue;
      const r = x + 1 < W ? src[y][x + 1] : ".";
      const b = y + 1 < H ? src[y + 1][x] : ".";
      if (r !== fill || b !== fill) t[y][x] = shadow;
    }
}
/** Ink outline of `n` pixels around the silhouette of a layer. */
function outline(t: Grid, n: number): Grid {
  let cur = t.map((r) => r.slice());
  for (let k = 0; k < n; k++) {
    const next = cur.map((r) => r.slice());
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (cur[y][x] !== ".") continue;
        if (
          (x > 0 && cur[y][x - 1] !== ".") ||
          (x + 1 < W && cur[y][x + 1] !== ".") ||
          (y > 0 && cur[y - 1][x] !== ".") ||
          (y + 1 < H && cur[y + 1][x] !== ".")
        )
          next[y][x] = "K";
      }
    cur = next;
  }
  return cur;
}
/** Draw a body part on its own layer, shade it, then add it to `into`. */
function part(into: Grid, draw: (t: Grid) => void, fill?: string, shadow?: string) {
  const t = blank(".");
  draw(t);
  if (fill && shadow) shade(t, fill, shadow);
  over(into, t);
}
/** An ink-ringed ellipse (ring first, then fill). */
function ring(t: Grid, cx: number, cy: number, rx: number, ry: number, fill: string) {
  ell(t, cx, cy, rx + 1, ry + 1, "K");
  ell(t, cx, cy, rx, ry, fill);
}
function toSprite(g: Grid): Sprite {
  return g.map((r) => r.join(""));
}
/** Scatter single pixels. */
function dots(g: Grid, pts: [number, number][], c: string) {
  pts.forEach(([x, y]) => px(g, x, y, c));
}

function ground(g: Grid, c: string, edge?: string) {
  rect(g, 0, 32, W, H - 32, c);
  if (edge) rect(g, 0, 32, W, 1, edge);
}

// ---------------------------------------------------------------- food
function food(): Grid {
  const g = blank("L");
  // Red sun, top-left.
  part(g, (t) => {
    ring(t, 9, 9, 4.5, 4.5, "R");
    px(t, 7, 6, "W");
    px(t, 8, 6, "W");
    px(t, 6, 7, "W");
  }, "R", "M");
  // A cloud.
  part(g, (t) => {
    ell(t, 49, 9, 6, 3.5, "W");
    ell(t, 54, 7, 4, 3, "W");
    ell(t, 44, 10, 4, 2.5, "W");
  }, "W", "S");
  ground(g, "G", "D");
  dots(g, [[4, 36], [5, 36], [13, 40], [14, 40], [26, 38], [27, 38], [34, 41], [35, 41], [47, 36], [48, 36], [58, 39], [59, 39]], "D");

  const L = blank(".");
  const cx = 36;
  // Ears, inner ear shaded.
  part(L, (t) => {
    ring(t, cx - 17.5, 19, 8, 10.5, "P");
    ring(t, cx + 17.5, 19, 8, 10.5, "P");
  }, "P", "M");
  part(L, (t) => {
    ell(t, cx - 18.5, 20, 4, 7, "M");
    ell(t, cx + 18.5, 20, 4, 7, "M");
  });
  // Red shirt.
  part(L, (t) => {
    ring(t, cx, 47, 21, 15, "R");
    px(t, cx - 14, 36, "W");
    px(t, cx - 13, 36, "W");
    px(t, cx - 14, 37, "W");
  }, "R", "M");
  // Head.
  part(L, (t) => {
    ring(t, cx, 18, 13.5, 12.5, "P");
    px(t, cx - 8, 9, "W");
    px(t, cx - 7, 9, "W");
    px(t, cx - 9, 10, "W");
    px(t, cx - 8, 10, "W");
  }, "P", "M");
  // Trunk, down the middle.
  part(L, (t) => {
    rect(t, cx - 4, 22, 8, 13, "K");
    rect(t, cx - 3, 22, 6, 12, "P");
    rect(t, cx - 3, 34, 7, 1, "K");
    rect(t, cx - 2, 35, 6, 1, "K");
    rect(t, cx + 1, 33, 4, 2, "P");
    px(t, cx + 4, 34, "K");
    px(t, cx + 5, 33, "K");
    px(t, cx + 5, 34, "K");
    px(t, cx - 3, 22, "P");
    px(t, cx + 2, 22, "P");
  }, "P", "M");
  // Arm and hand lifting the dosa.
  part(L, (t) => {
    thick(t, 22, 40, 11, 33, 3.5, "K");
    thick(t, 22, 40, 11, 33, 2.5, "P");
    ring(t, 8.5, 32, 3.5, 2.8, "P");
  }, "P", "M");
  const body = outline(L, 2);
  over(g, body);
  // Face: 2x2 eyes, blush, wrinkles on the trunk.
  rect(g, cx - 6, 15, 2, 2, "K");
  rect(g, cx + 4, 15, 2, 2, "K");
  rect(g, cx - 11, 21, 3, 1, "M");
  rect(g, cx + 8, 21, 3, 1, "M");
  rect(g, cx - 2, 27, 3, 1, "M");
  rect(g, cx - 2, 30, 4, 1, "M");
  // The dosa, held up.
  stamp(g, TILE_ART.dosa, -1, 15);
  return g;
}

// ------------------------------------------------------------- commute
function commute(): Grid {
  const g = blank("U");
  // Moon (crescent) and stars.
  ell(g, 53, 9, 5, 5, "Y");
  ell(g, 55.5, 8, 4.2, 4.2, "U");
  dots(g, [[13, 7], [22, 3], [41, 5], [59, 16], [61, 5]], "W");
  // Road with lane dashes and red tail-lights along the horizon.
  ground(g, "K", "H");
  for (let x = 2; x < W; x += 10) rect(g, x, 40, 5, 1, "H");
  for (const x of [11, 19, 44, 52, 59]) {
    px(g, x, 30, "R");
    px(g, x + 1, 30, "R");
    px(g, x, 31, "R");
    px(g, x + 1, 31, "R");
  }
  // Traffic light post, left edge.
  rect(g, 3, 24, 2, 19, "H");
  rect(g, 4, 24, 1, 19, "S");
  rect(g, 0, 4, 8, 21, "K");
  rect(g, 2, 7, 4, 4, "R");
  px(g, 2, 7, "W");
  rect(g, 2, 12, 4, 4, "O");
  rect(g, 2, 17, 4, 4, "D");
  rect(g, 1, 6, 1, 1, "R");
  rect(g, 6, 6, 1, 1, "R");

  const L = blank(".");
  const cx = 30;
  // Pointed ears behind the helmet.
  part(L, (t) => {
    tri(t, [cx - 14, 14], [cx - 11, 1], [cx - 4, 8], "S");
    tri(t, [cx + 14, 14], [cx + 11, 1], [cx + 4, 8], "S");
  }, "S", "H");
  // Shoulders (steel) and a hi-vis strap.
  part(L, (t) => {
    ring(t, cx, 48, 21, 16, "S");
    px(t, cx - 13, 37, "W");
    px(t, cx - 12, 37, "W");
  }, "S", "H");
  part(L, (t) => {
    tri(t, [cx - 6, 35], [cx - 2, 35], [cx - 11, 43], "Y");
    tri(t, [cx + 6, 35], [cx + 2, 35], [cx + 11, 43], "Y");
  });
  // Head.
  part(L, (t) => {
    ring(t, cx, 20, 13.5, 12, "S");
  }, "S", "H");
  // Muzzle.
  part(L, (t) => {
    ring(t, cx, 29.5, 6.5, 4.5, "W");
  }, "W", "S");
  // Inner ears.
  tri(L, [cx - 12, 11], [cx - 10, 3], [cx - 6, 8], "P");
  tri(L, [cx + 12, 11], [cx + 10, 3], [cx + 6, 8], "P");
  // Orange riding helmet with a visor.
  part(L, (t) => {
    ell(t, cx, 14, 15.5, 10.5, "K");
    ell(t, cx, 14, 14.5, 9.5, "O");
    for (let y = 16; y < H; y++) for (let x = 0; x < W; x++) t[y][x] = ".";
    px(t, cx - 8, 7, "W");
    px(t, cx - 7, 7, "W");
    px(t, cx - 9, 8, "W");
    px(t, cx - 8, 8, "W");
  }, "O", "R");
  part(L, (t) => {
    rect(t, cx - 15, 16, 30, 5, "K");
    rect(t, cx - 14, 17, 28, 3, "H");
    rect(t, cx - 13, 17, 6, 1, "W");
  });
  const body = outline(L, 2);
  over(g, body);
  rect(g, cx - 6, 22, 2, 2, "K");
  rect(g, cx + 4, 22, 2, 2, "K");
  rect(g, cx - 2, 26, 4, 2, "K");
  rect(g, cx - 1, 31, 2, 1, "K");
  return g;
}

// ------------------------------------------------------------ outdoors
function blossom(g: Grid, x: number, y: number) {
  part(g, (t) => {
    ell(t, x, y, 3.2, 3.2, "P");
    ell(t, x - 3, y + 2, 2.6, 2.6, "P");
    ell(t, x + 3, y + 2, 2.6, 2.6, "P");
    px(t, x - 1, y - 1, "W");
    px(t, x, y - 1, "W");
  }, "P", "M");
  px(g, Math.round(x), Math.round(y) + 1, "Y");
}
function outdoors(): Grid {
  const g = blank("L");
  ell(g, 54, 14, 5, 2.4, "W");
  ell(g, 50, 15, 4, 2, "W");
  ground(g, "G", "D");
  dots(g, [[5, 38], [6, 38], [20, 41], [21, 41], [38, 37], [39, 37], [52, 40], [53, 40]], "D");
  // Blossom clusters, top corners.
  rect(g, 0, 3, 14, 2, "N");
  rect(g, 2, 5, 2, 4, "N");
  rect(g, 50, 3, 14, 2, "N");
  rect(g, 59, 5, 2, 4, "N");
  blossom(g, 5, 6);
  blossom(g, 12, 8);
  blossom(g, 59, 6);
  blossom(g, 52, 8);
  // One falling petal.
  px(g, 45, 24, "P");
  px(g, 46, 24, "P");
  px(g, 46, 25, "M");

  const L = blank(".");
  const cx = 30;
  // Wing and body.
  part(L, (t) => {
    ring(t, cx, 45, 16, 15, "G");
    px(t, cx - 10, 33, "W");
    px(t, cx - 9, 33, "W");
  }, "G", "D");
  part(L, (t) => {
    ring(t, cx + 7, 42, 8, 9, "D");
  }, "D", "K");
  // Head.
  part(L, (t) => {
    ring(t, cx, 17, 13.5, 12.5, "G");
    px(t, cx - 9, 8, "W");
    px(t, cx - 8, 8, "W");
    px(t, cx - 10, 9, "W");
    px(t, cx - 9, 9, "W");
  }, "G", "D");
  // Yellow collar.
  part(L, (t) => {
    ell(t, cx, 30, 11, 3.5, "K");
    ell(t, cx, 29.5, 10, 2.5, "Y");
  }, "Y", "O");
  // Eye rings, a feather crest and a hooked red beak.
  part(L, (t) => {
    ell(t, cx - 6.5, 14.5, 3.4, 3.4, "W");
    ell(t, cx + 6.5, 14.5, 3.4, 3.4, "W");
  });
  dots(L, [[cx - 3, 4], [cx - 2, 4], [cx - 1, 4], [cx, 4], [cx + 1, 4], [cx + 2, 4], [cx - 2, 5], [cx - 1, 5], [cx, 5], [cx + 1, 5]], "D");
  part(L, (t) => {
    tri(t, [cx - 5, 19], [cx + 5, 19], [cx + 0.5, 28], "K");
    tri(t, [cx - 4, 19.5], [cx + 4, 19.5], [cx + 0.5, 26.5], "R");
    px(t, cx - 2, 21, "W");
    px(t, cx - 1, 21, "W");
  }, "R", "M");
  const body = outline(L, 2);
  over(g, body);
  rect(g, cx - 8, 14, 2, 2, "K");
  rect(g, cx + 6, 14, 2, 2, "K");
  // Brown branch across the frame, in front of the feet.
  const br = blank(".");
  thick(br, -2, 38, 66, 33, 2.6, "N");
  shade(br, "N", "K");
  const brk = outline(br, 1);
  over(g, brk);
  dots(g, [[8, 38], [9, 38], [22, 36], [23, 36], [40, 35], [41, 35], [55, 33], [56, 33]], "K");
  return g;
}

// -------------------------------------------------------------- hustle
function hustle(): Grid {
  const g = blank("P");
  // Dusk sky: violet dithered into pink.
  rect(g, 0, 0, W, 9, "V");
  checker(g, 0, 9, W, 3, "V", "P");
  checker(g, 0, 12, W, 2, "P", "V");
  // Sun low on the horizon, left.
  part(g, (t) => {
    ring(t, 9, 26, 5.5, 5.5, "Y");
    px(t, 6, 23, "W");
    px(t, 7, 23, "W");
  }, "Y", "O");
  // Two office towers with lit windows.
  rect(g, 49, 9, 9, 23, "U");
  rect(g, 56, 17, 8, 15, "U");
  rect(g, 42, 20, 8, 12, "U");
  for (let y = 11; y < 31; y += 4) for (const x of [51, 54]) px(g, x, y, "Y");
  for (let y = 19; y < 31; y += 4) for (const x of [58, 61]) px(g, x, y, "Y");
  for (let y = 22; y < 31; y += 4) px(g, 44, y, "Y");
  px(g, 47, 25, "Y");
  px(g, 47, 29, "Y");
  // Desk.
  ground(g, "N", "E");
  dots(g, [[6, 37], [7, 37], [18, 40], [19, 40], [30, 38], [31, 38], [47, 41], [48, 41]], "K");
  // Coffee cup, left.
  part(g, (t) => {
    ring(t, 8, 28, 4, 4, "C");
    rect(t, 5, 25, 7, 1, "N");
    rect(t, 11, 26, 3, 3, "K");
    rect(t, 12, 27, 1, 1, "P");
  });
  dots(g, [[6, 21], [7, 20], [9, 20], [10, 19]], "W");

  const L = blank(".");
  const cx = 28;
  // Ears.
  part(L, (t) => {
    tri(t, [cx - 14, 15], [cx - 11, 1], [cx - 3, 8], "O");
    tri(t, [cx + 14, 15], [cx + 11, 1], [cx + 3, 8], "O");
  }, "O", "R");
  tri(L, [cx - 12, 11], [cx - 10, 4], [cx - 6, 8], "P");
  tri(L, [cx + 12, 11], [cx + 10, 4], [cx + 6, 8], "P");
  // Head.
  part(L, (t) => {
    ring(t, cx, 16, 13.5, 11, "O");
    px(t, cx - 9, 8, "W");
    px(t, cx - 8, 8, "W");
    px(t, cx - 10, 9, "W");
    px(t, cx - 9, 9, "W");
    // forehead stripes
    rect(t, cx - 1, 6, 1, 3, "R");
    rect(t, cx - 5, 7, 1, 2, "R");
    rect(t, cx + 4, 7, 1, 2, "R");
  }, "O", "R");
  // Cream muzzle.
  part(L, (t) => {
    ell(t, cx, 21, 7, 4.5, "C");
  }, "C", "N");
  const body = outline(L, 2);
  over(g, body);
  rect(g, cx - 7, 13, 2, 2, "K");
  rect(g, cx + 5, 13, 2, 2, "K");
  rect(g, cx - 1, 20, 2, 1, "K");
  rect(g, cx - 2, 22, 4, 1, "K");
  // Teal screen-glow on the face.
  dots(g, [[cx - 11, 19], [cx - 10, 20], [cx - 9, 21], [cx + 10, 19], [cx + 9, 20], [cx + 8, 21], [cx - 3, 10], [cx + 2, 10]], "T");
  // Open steel laptop (lid facing us), in front of the cat.
  part(g, (t) => {
    rect(t, cx - 18, 26, 37, 13, "K");
    rect(t, cx - 17, 27, 35, 11, "S");
    rect(t, cx - 17, 27, 5, 1, "W");
    rect(t, cx - 17, 28, 1, 2, "W");
    rect(t, cx - 17, 37, 35, 1, "H");
    rect(t, cx + 17, 28, 1, 9, "H");
    rect(t, cx - 2, 31, 4, 3, "W");
    rect(t, cx - 21, 39, 43, 2, "K");
    rect(t, cx - 20, 39, 41, 1, "H");
  });
  return g;
}

// --------------------------------------------------------------- scene
function scene(): Grid {
  const g = blank("U");
  // Fairy lights.
  const bulbs = ["Y", "P", "T"];
  for (let x = 0; x < W; x++) {
    const y = 4 + Math.round(Math.sin((x / W) * Math.PI * 3) * 1.5 + 1);
    px(g, x, y, "H");
  }
  for (let i = 0, x = 4; x < W; x += 7, i++) {
    const y = 4 + Math.round(Math.sin((x / W) * Math.PI * 3) * 1.5 + 1);
    px(g, x, y + 1, "H");
    rect(g, x - 1, y + 2, 3, 2, bulbs[i % 3]);
  }
  // Little "?" sign, right.
  rect(g, 49, 12, 11, 14, "K");
  rect(g, 50, 13, 9, 12, "C");
  rect(g, 52, 15, 5, 1, "K");
  rect(g, 56, 16, 1, 2, "K");
  rect(g, 55, 18, 1, 1, "K");
  rect(g, 54, 19, 1, 2, "K");
  rect(g, 54, 22, 1, 1, "K");
  // Bar counter.
  ground(g, "N", "E");
  rect(g, 0, 33, W, 1, "K");
  dots(g, [[8, 37], [9, 37], [21, 40], [22, 40], [36, 38], [37, 38]], "K");
  // Pint glass, left.
  part(g, (t) => {
    rect(t, 3, 20, 11, 14, "K");
    rect(t, 4, 24, 9, 9, "Y");
    rect(t, 4, 21, 9, 3, "W");
    px(t, 3, 21, "W");
    px(t, 13, 21, "W");
    rect(t, 5, 25, 1, 5, "W");
    rect(t, 12, 25, 1, 8, "O");
    rect(t, 4, 32, 9, 1, "O");
  });

  const L = blank(".");
  const cx = 32;
  // Ear tufts.
  part(L, (t) => {
    tri(t, [cx - 14, 14], [cx - 13, 2], [cx - 5, 8], "N");
    tri(t, [cx + 14, 14], [cx + 13, 2], [cx + 5, 8], "N");
  }, "N", "K");
  // Wing holding the pint, body.
  part(L, (t) => {
    ring(t, cx, 48, 20, 15, "N");
  }, "N", "K");
  part(L, (t) => {
    ell(t, cx, 46, 11, 9, "C");
    for (const [x, y] of [[-5, 38], [0, 38], [5, 38], [-3, 41], [3, 41], [0, 44]] as [number, number][]) {
      px(t, cx + x, y, "N");
      px(t, cx + x + 1, y + 1, "N");
    }
  });
  part(L, (t) => {
    thick(t, cx - 15, 40, 15, 36, 3, "K");
    thick(t, cx - 15, 40, 15, 36, 2, "N");
  });
  // Head.
  part(L, (t) => {
    ring(t, cx, 18, 13.5, 12, "N");
    px(t, cx - 9, 8, "W");
    px(t, cx - 8, 8, "W");
    px(t, cx - 10, 9, "W");
  }, "N", "K");
  // Cream face disc with large yellow eyes.
  part(L, (t) => {
    ell(t, cx - 6, 18, 6.5, 6.5, "K");
    ell(t, cx + 6, 18, 6.5, 6.5, "K");
    ell(t, cx - 6, 18, 5.5, 5.5, "C");
    ell(t, cx + 6, 18, 5.5, 5.5, "C");
    ell(t, cx - 6, 18, 3.5, 3.5, "Y");
    ell(t, cx + 6, 18, 3.5, 3.5, "Y");
  });
  const body = outline(L, 2);
  over(g, body);
  rect(g, cx - 7, 17, 2, 2, "K");
  rect(g, cx + 5, 17, 2, 2, "K");
  px(g, cx - 8, 16, "W");
  px(g, cx + 4, 16, "W");
  // Beak.
  tri(g, [cx - 2.5, 20], [cx + 2.5, 20], [cx, 25], "O");
  rect(g, cx - 1, 20, 2, 1, "R");
  px(g, cx - 1, 25, "K");
  return g;
}

// ---------------------------------------------------------------- none
function none(): Grid {
  const g = blank("L");
  // A cloud.
  part(g, (t) => {
    ell(t, 18, 8, 7, 3.5, "W");
    ell(t, 24, 6, 4.5, 3.5, "W");
    ell(t, 12, 9, 4, 2.5, "W");
  }, "W", "S");
  // Small aeroplane, top-right.
  const plane = [
    "..K..........",
    "..KK.........",
    ".KKKKKKKKKK..",
    "KKKKWKWKKKKKK",
    ".KKKKKKKKKK..",
    "....KKKK.....",
    ".....KK......",
  ];
  stamp(g, plane, 49, 4);
  // Sandy ground.
  ground(g, "E", "N");
  dots(g, [[4, 36], [5, 36], [14, 40], [26, 38], [27, 38], [40, 36], [49, 39], [50, 39], [58, 37]], "N");

  const L = blank(".");
  const cx = 34;
  // Pointed ears.
  part(L, (t) => {
    tri(t, [cx - 15, 15], [cx - 13, 0], [cx - 4, 8], "O");
    tri(t, [cx + 15, 15], [cx + 13, 0], [cx + 4, 8], "O");
  }, "O", "R");
  tri(L, [cx - 13, 11], [cx - 12, 4], [cx - 7, 8], "K");
  tri(L, [cx + 13, 11], [cx + 12, 4], [cx + 7, 8], "K");
  // Shoulders with a white chest.
  part(L, (t) => {
    ring(t, cx, 48, 21, 16, "O");
    px(t, cx - 14, 37, "W");
    px(t, cx - 13, 37, "W");
  }, "O", "R");
  part(L, (t) => {
    tri(t, [cx - 8, 33], [cx + 8, 33], [cx, 44], "W");
  }, "W", "S");
  // Head with white cheeks.
  part(L, (t) => {
    ring(t, cx, 18, 14, 11, "O");
    px(t, cx - 9, 9, "W");
    px(t, cx - 8, 9, "W");
    px(t, cx - 10, 10, "W");
  }, "O", "R");
  part(L, (t) => {
    tri(t, [cx - 14, 20], [cx - 3, 23], [cx - 5, 28], "W");
    tri(t, [cx + 14, 20], [cx + 3, 23], [cx + 5, 28], "W");
    ell(t, cx, 24.5, 6.5, 4.5, "W");
  }, "W", "S");
  const body = outline(L, 2);
  over(g, body);
  rect(g, cx - 7, 15, 2, 2, "K");
  rect(g, cx + 5, 15, 2, 2, "K");
  rect(g, cx - 1, 22, 3, 2, "K");
  rect(g, cx - 1, 27, 2, 1, "K");
  // Red suitcase with a yellow tag, left.
  part(g, (t) => {
    rect(t, 2, 24, 17, 13, "K");
    rect(t, 3, 25, 15, 11, "R");
    rect(t, 3, 25, 4, 1, "W");
    rect(t, 3, 26, 1, 2, "W");
    rect(t, 3, 35, 15, 1, "M");
    rect(t, 17, 27, 1, 8, "M");
    rect(t, 6, 21, 9, 3, "K");
    rect(t, 7, 22, 7, 2, "R");
    rect(t, 3, 29, 15, 1, "M");
    rect(t, 5, 28, 2, 3, "Y");
    rect(t, 13, 28, 2, 3, "Y");
  });
  rect(g, 8, 24, 5, 4, "Y");
  rect(g, 9, 25, 3, 2, "W");
  return g;
}

export const AVATARS: Record<AvatarId, Sprite> = {
  food: toSprite(food()),
  commute: toSprite(commute()),
  outdoors: toSprite(outdoors()),
  hustle: toSprite(hustle()),
  scene: toSprite(scene()),
  none: toSprite(none()),
};

export function avatarRects(id: AvatarId, opts: { x?: number; y?: number; scale?: number } = {}): string {
  return spriteRects(AVATARS[id], opts);
}
