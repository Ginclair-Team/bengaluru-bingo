// Tile characters, drawn by hand as SVG on a 48x48 grid: thick black outline,
// flat fills. Plain strings so the same art renders in React and in the
// server-side scorecard SVG.

const C = {
  yellow: "#FFC93C",
  orange: "#FF8A3D",
  red: "#FF4757",
  pink: "#FF8FB8",
  green: "#3CC47C",
  blue: "#4DA8F7",
  sky: "#BDEBFF",
  purple: "#A56EDB",
  lilac: "#CDB9F0",
  cream: "#FFF4DC",
  steel: "#C9D3DA",
  brown: "#A0623A",
  wood: "#F2D29B",
};

/** Two dot eyes and a small smile, centred on (x, y). */
function face(x: number, y: number): string {
  return (
    `<circle cx="${x - 3.5}" cy="${y}" r="1.3" fill="#000" stroke="none"/>` +
    `<circle cx="${x + 3.5}" cy="${y}" r="1.3" fill="#000" stroke="none"/>` +
    `<path d="M${x - 2.5} ${y + 3.2} Q${x} ${y + 5.6} ${x + 2.5} ${y + 3.2}" fill="none"/>`
  );
}

export const TILE_ART: Record<string, string> = {
  dosa:
    `<ellipse cx="24" cy="37" rx="19" ry="5" fill="${C.cream}"/>` +
    `<path d="M9 35 L24 8 L39 35 Z" fill="${C.yellow}"/>` +
    `<circle cx="38" cy="33" r="4.5" fill="${C.green}"/>` +
    face(24, 25),

  signal:
    `<path d="M24 38 V45" fill="none"/>` +
    `<rect x="15" y="4" width="18" height="34" rx="6" fill="${C.yellow}"/>` +
    `<circle cx="24" cy="12" r="4" fill="${C.red}"/>` +
    `<circle cx="24" cy="21" r="4" fill="${C.cream}"/>` +
    `<circle cx="24" cy="30" r="4" fill="${C.cream}"/>`,

  tree:
    `<rect x="21" y="27" width="6" height="14" fill="${C.brown}"/>` +
    `<path d="M10 28 Q4 22 10 16 Q10 6 20 7 Q26 2 33 8 Q43 9 40 19 Q44 26 36 29 Q30 33 24 29 Q16 33 10 28 Z" fill="${C.green}"/>` +
    `<path d="M9 42 H39" fill="none"/>` +
    face(24, 17),

  rocket:
    `<path d="M20 31 Q24 46 28 31 Z" fill="${C.orange}"/>` +
    `<path d="M17 24 L9 34 H18 Z" fill="${C.red}"/>` +
    `<path d="M31 24 L39 34 H30 Z" fill="${C.red}"/>` +
    `<path d="M24 4 Q34 14 31 31 H17 Q14 14 24 4 Z" fill="${C.cream}"/>` +
    `<circle cx="24" cy="17" r="4" fill="${C.blue}"/>`,

  beer:
    `<path d="M31 20 H35 Q40 20 40 25 V28 Q40 33 35 33 H31" fill="none"/>` +
    `<rect x="12" y="15" width="19" height="25" rx="3" fill="${C.yellow}"/>` +
    `<path d="M10 17 Q9 9 17 11 Q21 5 27 10 Q35 9 33 17 Z" fill="${C.cream}"/>` +
    face(21.5, 27),

  sunrise:
    `<path d="M24 4 V8 M9 11 L12 14 M39 11 L36 14 M4 24 H8 M40 24 H44" fill="none"/>` +
    `<circle cx="24" cy="24" r="10" fill="${C.orange}"/>` +
    face(24, 21) +
    `<path d="M3 42 Q13 24 24 36 Q35 25 45 42 Z" fill="${C.green}"/>`,

  bean:
    `<ellipse cx="24" cy="18" rx="11" ry="13" fill="${C.brown}"/>` +
    `<path d="M24 5 Q21 9 24 12" fill="none"/>` +
    face(24, 18) +
    `<rect x="11" y="28" width="26" height="13" rx="2" fill="${C.steel}"/>` +
    `<circle cx="24" cy="34.5" r="2" fill="${C.cream}"/>` +
    `<path d="M7 42 H41" fill="none"/>`,

  quiz:
    `<path d="M24 4 V8 M13 8 L15 11 M35 8 L33 11" fill="none"/>` +
    `<path d="M11 31 Q11 13 24 13 Q37 13 37 31 Z" fill="${C.red}"/>` +
    `<rect x="7" y="31" width="34" height="9" rx="3" fill="${C.yellow}"/>` +
    face(24, 22),

  kaapi:
    `<path d="M20 9 Q18 6 20 3 M27 9 Q25 6 27 3" fill="none"/>` +
    `<path d="M11 31 H37 L34 41 H14 Z" fill="${C.steel}"/>` +
    `<path d="M15 12 H33 L31 33 H17 Z" fill="${C.steel}"/>` +
    `<ellipse cx="24" cy="12.5" rx="9" ry="2.6" fill="${C.brown}"/>` +
    face(24, 22),

  metro:
    `<path d="M15 38 L10 45 M33 38 L38 45" fill="none"/>` +
    `<rect x="9" y="6" width="30" height="32" rx="9" fill="${C.purple}"/>` +
    `<rect x="13" y="11" width="22" height="13" rx="3" fill="${C.sky}"/>` +
    face(24, 15.5) +
    `<circle cx="16" cy="31" r="2.2" fill="${C.yellow}"/>` +
    `<circle cx="32" cy="31" r="2.2" fill="${C.yellow}"/>`,

  book:
    `<rect x="10" y="7" width="28" height="34" rx="3" fill="${C.red}"/>` +
    `<path d="M15 7 V41" fill="none"/>` +
    `<path d="M29 7 V18 L32 15 L35 18 V7 Z" fill="${C.yellow}"/>` +
    `<path d="M15 36 H38" fill="none"/>` +
    face(25.5, 25),

  chaat:
    `<circle cx="16" cy="19" r="5.5" fill="${C.yellow}"/>` +
    `<circle cx="27" cy="16" r="6.5" fill="${C.yellow}"/>` +
    `<circle cx="35" cy="21" r="4.5" fill="${C.yellow}"/>` +
    `<path d="M6 23 H42 Q40 41 24 41 Q8 41 6 23 Z" fill="${C.green}"/>` +
    face(24, 30),

  auto:
    `<path d="M7 35 V25 Q7 11 22 11 H29 Q41 13 41 27 V35 Z" fill="${C.yellow}"/>` +
    `<path d="M7 25 Q7 11 22 11 H29 Q38 12 40.5 22 Z" fill="${C.green}"/>` +
    `<rect x="24" y="16" width="10" height="9" rx="2" fill="${C.sky}"/>` +
    `<circle cx="15" cy="37" r="4.5" fill="#000"/>` +
    `<circle cx="34" cy="37" r="4.5" fill="#000"/>`,

  flower:
    `<path d="M24 30 V45 M24 39 Q31 38 32 32" fill="none"/>` +
    `<circle cx="24" cy="9" r="6" fill="${C.pink}"/>` +
    `<circle cx="33.5" cy="14.5" r="6" fill="${C.pink}"/>` +
    `<circle cx="33.5" cy="25.5" r="6" fill="${C.pink}"/>` +
    `<circle cx="24" cy="31" r="6" fill="${C.pink}"/>` +
    `<circle cx="14.5" cy="25.5" r="6" fill="${C.pink}"/>` +
    `<circle cx="14.5" cy="14.5" r="6" fill="${C.pink}"/>` +
    `<circle cx="24" cy="20" r="7.5" fill="${C.yellow}"/>` +
    face(24, 18.5),

  neon:
    `<path d="M14 13 V5 M34 13 V5" fill="none"/>` +
    `<rect x="6" y="13" width="36" height="22" rx="5" fill="#2B1E5C"/>` +
    `<circle cx="18" cy="21" r="2.4" fill="${C.yellow}" stroke="none"/>` +
    `<circle cx="30" cy="21" r="2.4" fill="${C.yellow}" stroke="none"/>` +
    `<path d="M17 27 Q24 33 31 27" fill="none" stroke="${C.pink}" stroke-width="2.4"/>` +
    `<path d="M10 41 L12 38 M24 43 V39 M38 41 L36 38" fill="none"/>`,

  bus:
    `<rect x="5" y="11" width="38" height="25" rx="5" fill="${C.red}"/>` +
    `<rect x="9" y="15" width="8" height="8" rx="1.5" fill="${C.sky}"/>` +
    `<rect x="20" y="15" width="8" height="8" rx="1.5" fill="${C.sky}"/>` +
    `<rect x="31" y="15" width="8" height="8" rx="1.5" fill="${C.sky}"/>` +
    `<path d="M5 28 H43" fill="none"/>` +
    `<circle cx="14" cy="37" r="4.5" fill="#000"/>` +
    `<circle cx="34" cy="37" r="4.5" fill="#000"/>`,

  cloud:
    `<path d="M14 33 L12 39 M24 33 L22 41 M34 33 L32 39" fill="none" stroke="${C.blue}" stroke-width="3"/>` +
    `<path d="M12 28 Q5 28 5 21.5 Q5 15 13 15 Q15 7 24 8 Q32 7 34 14 Q43 14 43 21.5 Q43 28 36 28 Z" fill="${C.cream}"/>` +
    face(24, 18.5),

  key:
    `<rect x="22" y="19" width="21" height="5" fill="${C.yellow}"/>` +
    `<rect x="32" y="24" width="4" height="6" fill="${C.yellow}"/>` +
    `<rect x="38.5" y="24" width="4" height="4.5" fill="${C.yellow}"/>` +
    `<circle cx="15" cy="21.5" r="10" fill="${C.yellow}"/>` +
    `<circle cx="11.5" cy="21.5" r="2.6" fill="${C.cream}"/>` +
    `<path d="M9 38 H39" fill="none" stroke-dasharray="1 5"/>`,

  bubble:
    `<path d="M6 8 H42 V31 H27 L19 40 V31 H6 Z" fill="${C.blue}"/>` +
    `<circle cx="15" cy="19.5" r="2.6" fill="${C.cream}"/>` +
    `<circle cx="24" cy="19.5" r="2.6" fill="${C.cream}"/>` +
    `<circle cx="33" cy="19.5" r="2.6" fill="${C.cream}"/>`,

  idli:
    `<ellipse cx="24" cy="35" rx="19" ry="6" fill="${C.steel}"/>` +
    `<ellipse cx="16" cy="29" rx="8.5" ry="5" fill="${C.cream}"/>` +
    `<ellipse cx="32" cy="29" rx="8.5" ry="5" fill="${C.cream}"/>` +
    `<circle cx="24" cy="17" r="8" fill="${C.orange}"/>` +
    `<circle cx="24" cy="17" r="2.4" fill="${C.cream}"/>`,

  house:
    `<path d="M9 22 V41 H39 V22 L24 8 Z" fill="${C.pink}"/>` +
    `<path d="M4 24 L24 6 L44 24" fill="none"/>` +
    `<rect x="20" y="29" width="8" height="12" fill="${C.cream}"/>` +
    `<circle cx="37" cy="11" r="6.5" fill="${C.yellow}"/>` +
    `<path d="M34.5 8.5 H39.5 M34.5 10.8 H39.5 M35 8.5 Q38.6 8.6 38 10.8 Q37.4 13 35 13 L38.4 15.2" fill="none" stroke-width="1.2"/>`,

  cricket:
    `<g transform="rotate(38 26 22)">` +
    `<rect x="23.5" y="27" width="5" height="13" fill="#000"/>` +
    `<rect x="21" y="2" width="10" height="26" rx="3" fill="${C.wood}"/>` +
    `</g>` +
    `<circle cx="36" cy="36" r="6" fill="${C.red}"/>` +
    `<path d="M32 32.5 Q36 36 40 39.5" fill="none" stroke-width="1.2"/>`,

  biryani:
    `<path d="M9 26 H5 M39 26 H43" fill="none"/>` +
    `<path d="M9 22 H39 V31 Q39 41 29 41 H19 Q9 41 9 31 Z" fill="${C.orange}"/>` +
    `<path d="M10 22 Q24 6 38 22 Z" fill="${C.steel}"/>` +
    `<circle cx="24" cy="10.5" r="2.6" fill="${C.cream}"/>` +
    face(24, 29.5),

  phone:
    `<rect x="13" y="4" width="22" height="40" rx="5" fill="${C.cream}"/>` +
    `<rect x="16.5" y="9" width="15" height="25" rx="1.5" fill="${C.pink}"/>` +
    `<path d="M20 17 L28 26 M28 17 L20 26" fill="none" stroke-width="2.6"/>` +
    `<circle cx="24" cy="39" r="1.6" fill="#000" stroke="none"/>`,

  elephant:
    `<circle cx="10" cy="22" r="7" fill="${C.lilac}"/>` +
    `<circle cx="38" cy="22" r="7" fill="${C.lilac}"/>` +
    `<circle cx="24" cy="22" r="12" fill="${C.lilac}"/>` +
    `<path d="M21 26 H27 V35 Q27 40 32 39 L32 44 Q21 45 21 35 Z" fill="${C.lilac}"/>` +
    `<path d="M11 21 Q10 5 24 5 Q38 5 37 21 Q31 12 24 12 Q17 12 11 21 Z" fill="${C.yellow}"/>` +
    `<circle cx="19" cy="21" r="1.4" fill="#000" stroke="none"/>` +
    `<circle cx="29" cy="21" r="1.4" fill="#000" stroke="none"/>`,
};

/** A complete, standalone SVG for one tile character. */
export function tileSvg(id: string, strokeWidth = 2): string {
  const art = TILE_ART[id] ?? "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">` +
    `<g stroke="#000" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round">${art}</g>` +
    `</svg>`
  );
}
