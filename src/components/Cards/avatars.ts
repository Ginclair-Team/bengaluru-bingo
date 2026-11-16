import type { CategoryId } from "@/lib/game";

// Scorecard characters, one per badge. Drawn on a 240x176 scene: thick black
// outline, flat fills, a two-stop pastel sky behind. Plain SVG strings so the
// same drawing works in the page and in the server-rendered image.

export type AvatarId = CategoryId | "none";

function sky(id: string, from: string, to: string): string {
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect x="-4" y="-4" width="248" height="184" fill="url(#${id})" stroke="none"/>`
  );
}

function eyes(y: number, r = 5): string {
  return (
    `<circle cx="98" cy="${y}" r="${r}" fill="#000" stroke="none"/>` +
    `<circle cx="142" cy="${y}" r="${r}" fill="#000" stroke="none"/>`
  );
}

const body = (fill: string) =>
  `<path d="M52 180 V152 Q52 120 86 120 H154 Q188 120 188 152 V180 Z" fill="${fill}"/>`;

const SCENES: Record<AvatarId, (uid: string) => string> = {
  // Foodie: an elephant with a dosa.
  food: (uid) =>
    sky(`sky-${uid}`, "#8FD6FF", "#E4F7FF") +
    `<circle cx="36" cy="34" r="16" fill="#FF4757"/>` +
    `<rect x="-4" y="134" width="248" height="50" fill="#5FD08A"/>` +
    `<ellipse cx="62" cy="84" rx="30" ry="38" fill="#FF8FB8"/>` +
    `<ellipse cx="178" cy="84" rx="30" ry="38" fill="#FF8FB8"/>` +
    body("#FF4757") +
    `<rect x="70" y="32" width="100" height="100" rx="44" fill="#FFB8D4"/>` +
    `<path d="M108 94 H132 V138 Q132 156 150 152 V170 Q108 176 108 138 Z" fill="#FFB8D4"/>` +
    eyes(80) +
    `<path d="M178 172 L205 108 L232 172 Z" fill="#FFC93C"/>` +
    `<circle cx="190" cy="160" r="11" fill="#FFB8D4"/>`,

  // Tech Guru: a cat behind a laptop.
  hustle: (uid) =>
    sky(`sky-${uid}`, "#D6C2FF", "#FFD6E8") +
    `<circle cx="204" cy="34" r="17" fill="#FFC93C"/>` +
    body("#3CC47C") +
    `<path d="M78 62 L82 20 L114 46 Z" fill="#FFA53C"/>` +
    `<path d="M162 62 L158 20 L126 46 Z" fill="#FFA53C"/>` +
    `<rect x="72" y="38" width="96" height="86" rx="36" fill="#FFA53C"/>` +
    eyes(76) +
    `<path d="M115 88 H125 L120 94 Z" fill="#FF8FB8"/>` +
    `<path d="M120 94 V99 M120 99 Q114 106 109 100 M120 99 Q126 106 131 100 M84 90 H64 M84 98 L66 105 M156 90 H176 M156 98 L174 105" fill="none"/>` +
    `<rect x="66" y="132" width="108" height="50" rx="6" fill="#C9D3DA"/>` +
    `<circle cx="120" cy="156" r="7" fill="#FFF4DC"/>` +
    `<rect x="190" y="140" width="30" height="42" rx="4" fill="#FFF4DC"/>` +
    `<rect x="186" y="132" width="38" height="10" rx="3" fill="#A0623A"/>`,

  // Jam Survivor: a wolf in a riding helmet, out after dark.
  commute: (uid) =>
    sky(`sky-${uid}`, "#2B3A8C", "#7C6BD6") +
    `<circle cx="40" cy="36" r="17" fill="#FFC93C"/>` +
    `<path d="M196 28 V40 M190 34 H202 M214 70 V78 M210 74 H218" fill="none" stroke="#FFF4DC"/>` +
    body("#FF8FB8") +
    `<path d="M80 60 L76 22 L108 46 Z" fill="#8FB2E8"/>` +
    `<path d="M160 60 L164 22 L132 46 Z" fill="#8FB2E8"/>` +
    `<rect x="72" y="40" width="96" height="88" rx="34" fill="#8FB2E8"/>` +
    `<path d="M68 76 Q68 20 120 20 Q172 20 172 76 Z" fill="#FF8A3D"/>` +
    `<path d="M68 66 H172" fill="none"/>` +
    `<ellipse cx="120" cy="108" rx="26" ry="17" fill="#E3EEFF"/>` +
    `<ellipse cx="120" cy="100" rx="7" ry="5" fill="#000"/>` +
    `<path d="M120 105 V112 M111 113 Q120 120 129 113" fill="none"/>` +
    eyes(88),

  // Park Walker: a parakeet on a branch.
  outdoors: (uid) =>
    sky(`sky-${uid}`, "#B9F2C8", "#FFF6BE") +
    `<circle cx="200" cy="38" r="19" fill="#FF8A3D"/>` +
    `<path d="M-4 150 Q50 96 110 140 Q170 100 244 146 V184 H-4 Z" fill="#5FD08A"/>` +
    `<path d="M98 128 L84 180 H114 Z" fill="#4DA8F7"/>` +
    `<rect x="-4" y="142" width="248" height="15" fill="#A0623A"/>` +
    `<path d="M116 40 Q124 18 138 30 Q130 34 134 42 Z" fill="#FF4757"/>` +
    `<ellipse cx="124" cy="92" rx="50" ry="56" fill="#FF4757"/>` +
    `<path d="M152 66 Q190 96 160 142 Q130 124 152 66 Z" fill="#4DA8F7"/>` +
    `<path d="M158 100 Q172 112 160 132" fill="none"/>` +
    `<path d="M84 70 Q58 76 70 102 Q86 98 92 84 Z" fill="#FFC93C"/>` +
    `<circle cx="106" cy="70" r="9" fill="#FFF4DC"/>` +
    `<circle cx="106" cy="70" r="3.6" fill="#000" stroke="none"/>` +
    `<path d="M112 146 V156 M134 146 V156" fill="none"/>`,

  // Quiz Captain: an owl with a pint.
  scene: (uid) =>
    sky(`sky-${uid}`, "#2B1E5C", "#7A4FE0") +
    `<circle cx="38" cy="36" r="17" fill="#FFC93C"/>` +
    `<path d="M200 30 V42 M194 36 H206 M24 84 V92 M20 88 H28" fill="none" stroke="#FFF4DC"/>` +
    `<path d="M82 52 L78 20 L106 40 Z" fill="#B78BEA"/>` +
    `<path d="M158 52 L162 20 L134 40 Z" fill="#B78BEA"/>` +
    `<path d="M62 180 V100 Q62 34 120 34 Q178 34 178 100 V180 Z" fill="#B78BEA"/>` +
    `<ellipse cx="120" cy="150" rx="34" ry="38" fill="#FFF4DC"/>` +
    `<circle cx="98" cy="84" r="20" fill="#FFF4DC"/>` +
    `<circle cx="142" cy="84" r="20" fill="#FFF4DC"/>` +
    `<circle cx="98" cy="84" r="7" fill="#000" stroke="none"/>` +
    `<circle cx="142" cy="84" r="7" fill="#000" stroke="none"/>` +
    `<path d="M111 104 H129 L120 120 Z" fill="#FFC93C"/>` +
    `<path d="M214 132 H222 Q232 132 232 142 V148 Q232 158 222 158 H214" fill="none"/>` +
    `<rect x="184" y="124" width="32" height="50" rx="4" fill="#FFC93C"/>` +
    `<path d="M180 128 Q178 112 192 116 Q200 106 208 114 Q222 112 220 128 Z" fill="#FFF4DC"/>`,

  // New Arrival: a fox with a suitcase.
  none: (uid) =>
    sky(`sky-${uid}`, "#FFE2B4", "#FFD0E2") +
    `<circle cx="38" cy="36" r="17" fill="#FF4757"/>` +
    `<rect x="-4" y="150" width="248" height="34" fill="#FFF4DC"/>` +
    body("#A56EDB") +
    `<path d="M78 62 L72 18 L110 44 Z" fill="#FF8A3D"/>` +
    `<path d="M162 62 L168 18 L130 44 Z" fill="#FF8A3D"/>` +
    `<path d="M68 72 Q68 36 120 36 Q172 36 172 72 Q172 96 120 130 Q68 96 68 72 Z" fill="#FF8A3D"/>` +
    `<path d="M92 100 Q120 84 148 100 L120 130 Z" fill="#FFF4DC"/>` +
    `<ellipse cx="120" cy="102" rx="7" ry="5" fill="#000"/>` +
    eyes(74) +
    `<path d="M192 122 V110 Q192 104 198 104 H208 Q214 104 214 110 V122" fill="none"/>` +
    `<rect x="178" y="122" width="50" height="46" rx="6" fill="#4DA8F7"/>` +
    `<path d="M178 140 H228" fill="none"/>`,
};

/** Inner SVG for an avatar scene. `uid` keeps gradient ids unique per page. */
export function avatarScene(id: AvatarId, uid: string): string {
  // The score badge sits over the scene's bottom-right corner, so scenes
  // whose prop is drawn on the right are mirrored to keep it in view.
  const mirrored = id === "food" || id === "hustle" || id === "scene" || id === "none";
  return (
    `<g ${mirrored ? `transform="translate(240 0) scale(-1 1)" ` : ""}stroke="#000" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">` +
    SCENES[id](uid) +
    `</g>`
  );
}
