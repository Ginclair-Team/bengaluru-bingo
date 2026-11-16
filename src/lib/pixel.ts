// Pixel-art sprite system (DESIGN.md section 8).
//
// A sprite is an array of equal-length strings, one character per pixel.
// `.` is transparent; every other character is a key into PALETTE.
// One function turns a grid into SVG <rect>s (one per horizontal run of the
// same colour); the same output is used in React and inside scorecardSvg.

export const PALETTE: Record<string, string> = {
  // Warm Ginclair set: every hue stays distinct so sprites still read, but
  // all of them lean toward cream, brown and salmon.
  K: "#2E1F18", // ink (espresso)
  W: "#FFF9F0", // white (warm)
  C: "#F6E3C8", // cream
  Y: "#F2C14E", // yellow (turmeric)
  O: "#E8894F", // orange
  R: "#D4513F", // red (brick)
  P: "#F59A86", // salmon (was pink)
  M: "#A93D29", // deep salmon (stamp)
  V: "#8C6A94", // violet (dusty plum)
  B: "#7598B5", // blue (dusty)
  T: "#74AFA4", // teal (muted)
  G: "#86B26A", // green
  D: "#4F7A46", // dark green
  N: "#9A6440", // brown
  S: "#CDC2B5", // steel (warm grey)
  H: "#8A7B6C", // dark steel (warm)
  // Avatar-scene backdrop keys only.
  L: "#F4DFC6", // day sky (peach cream)
  U: "#3D2B33", // night sky (cocoa)
  E: "#D9B07C", // ground / sand
};

export type Sprite = string[];

export type RectOpts = { mono?: boolean; x?: number; y?: number; scale?: number };

/** Dev-time check: equal row lengths and known keys. Returns problems found. */
export function validateSprite(grid: Sprite, name = "sprite"): string[] {
  const problems: string[] = [];
  const w = grid[0]?.length ?? 0;
  grid.forEach((row, r) => {
    if (row.length !== w) problems.push(`${name}: row ${r} has ${row.length} columns, expected ${w}`);
    for (let c = 0; c < row.length; c++) {
      const k = row[c];
      if (k !== "." && !(k in PALETTE)) problems.push(`${name}: unknown key "${k}" at row ${r}, col ${c}`);
    }
  });
  return problems;
}

function devCheck(grid: Sprite) {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") return;
  const problems = validateSprite(grid);
  if (problems.length) console.error(problems.join("\n"));
}

/** Run-length encode a grid into `<rect>` elements. */
export function spriteRects(grid: Sprite, opts: RectOpts = {}): string {
  devCheck(grid);
  const { mono = false, x = 0, y = 0, scale = 1 } = opts;
  let out = "";
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    let c = 0;
    while (c < row.length) {
      const k = row[c];
      if (k === ".") {
        c++;
        continue;
      }
      let end = c + 1;
      while (end < row.length && row[end] === k) end++;
      const fill = mono ? "currentColor" : (PALETTE[k] ?? "#FF00FF");
      out += `<rect x="${x + c * scale}" y="${y + r * scale}" width="${(end - c) * scale}" height="${scale}" fill="${fill}"/>`;
      c = end;
    }
  }
  return out;
}

/** A full standalone `<svg>` string for a sprite. */
export function spriteSvg(
  grid: Sprite,
  opts: { mono?: boolean; className?: string; title?: string } = {}
): string {
  const w = grid[0]?.length ?? 0;
  const h = grid.length;
  const cls = opts.className ? ` class="${opts.className}"` : "";
  const a11y = opts.title ? ` role="img"` : ` aria-hidden="true"`;
  const title = opts.title ? `<title>${opts.title}</title>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges"${a11y}${cls}>` +
    title +
    spriteRects(grid, { mono: opts.mono }) +
    `</svg>`
  );
}
