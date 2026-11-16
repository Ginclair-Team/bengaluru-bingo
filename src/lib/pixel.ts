// Pixel-art sprite system (DESIGN.md section 8).
//
// A sprite is an array of equal-length strings, one character per pixel.
// `.` is transparent; every other character is a key into PALETTE.
// One function turns a grid into SVG <rect>s (one per horizontal run of the
// same colour); the same output is used in React and inside scorecardSvg.

export const PALETTE: Record<string, string> = {
  K: "#1A1C2C", // ink
  W: "#FFFFFF", // white
  C: "#FFE9C4", // cream
  Y: "#FFD23F", // yellow
  O: "#FF8A3D", // orange
  R: "#E5383B", // red
  P: "#FF6FB5", // pink
  M: "#C2185B", // magenta
  V: "#8E5BD9", // violet
  B: "#3D8BFD", // blue
  T: "#23C4C4", // teal
  G: "#3CC47C", // green
  D: "#1E7A4C", // dark green
  N: "#A0623A", // brown
  S: "#B8C4CC", // steel
  H: "#6B7A86", // dark steel
  // Avatar-scene backdrop keys only.
  L: "#A8E4FF", // day sky
  U: "#2D2A6E", // night sky
  E: "#E8C27A", // ground / sand
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
