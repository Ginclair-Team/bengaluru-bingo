import type { Sprite } from "@/lib/pixel";
import type { Mood, Species } from "./data";

/** Spec section F. Pets, food, decor and traffic are 16 x 16 or 8 x 8. */

// ---- Cat: ginger with stripes and a cream muzzle ----

const CAT_IDLE: Sprite = [
  "..KK........KK..",
  "..KOK......KOK..",
  "..KKKKKKKKKKKK..",
  "..KWOOOOOOOOOK..",
  ".KWOOOOOOOOOOOK.",
  ".KOOOONOONOOOOK.",
  ".KOOOOOOOOOOOOK.",
  ".KOOKOOOOOOKOOK.",
  ".KOOKOOOOOOKOOK.",
  ".KOOCCCPPCCCOOK.",
  ".KOOCCCKKCCCOOK.",
  ".KOOOCCCCCCOOOK.",
  "..KOOOOOOOOOOK..",
  "...KKKKKKKKKK...",
  "...KK......KK...",
  "................",
];

const CAT_HAPPY: Sprite = [
  "..KK........KK..",
  "..KOK......KOK..",
  "..KKKKKKKKKKKK..",
  "..KWOOOOOOOOOK..",
  ".KWOOOOOOOOOOOK.",
  ".KOOOONOONOOOOK.",
  ".KOOOOOOOOOOOOK.",
  ".KOOKOOOOOOKOOK.",
  ".KOKOKOOOOKOKOK.",
  ".KPPCCCPPCCCPPK.",
  ".KOOCCKCCKCCOOK.",
  ".KOOOCCCCCCOOOK.",
  "..KOOOOOOOOOOK..",
  "...KKKKKKKKKK...",
  "...KK......KK...",
  "................",
];

const CAT_HUNGRY: Sprite = [
  "..KK........KK..",
  "..KOK......KOK..",
  "..KKKKKKKKKKKK..",
  "..KWOOOOOOOOOK..",
  ".KWOOOOOOOOOOBK.",
  ".KOOOONOONOOOOK.",
  ".KOOOOOOOOOOOOK.",
  ".KOOKOOOOOOKOOK.",
  ".KOOKOOOOOOKOOK.",
  ".KOOCCCPPCCCOOK.",
  ".KOOCCKRRKCCOOK.",
  ".KOOOCCCCCCOOOK.",
  "..KOOOOOOOOOOK..",
  "...KKKKKKKKKK...",
  "...KK......KK...",
  "................",
];

const CAT_SLEEPY: Sprite = [
  "..KK........KK..",
  "..KOK......KOK..",
  "..KKKKKKKKKKKK..",
  "..KWOOOOOOOOOK..",
  ".KWOOOOOOOOOOOK.",
  ".KOOOONOONOOOOK.",
  ".KOOOOOOOOOOOOK.",
  ".KOOOOOOOOOOOOK.",
  ".KOOKKKOOOKKKOK.",
  ".KOOCCCPPCCCOOK.",
  ".KOOCCCCCCCCOOK.",
  ".KOOOCCCCCCOOOK.",
  "..KOOOOOOOOOOK..",
  "...KKKKKKKKKK...",
  "...KK......KK...",
  "................",
];

const CAT_SAD: Sprite = [
  "..KK........KK..",
  "..KOK......KOK..",
  "..KKKKKKKKKKKK..",
  "..KWOOOOOOOOOK..",
  ".KWOOOOOOOOOOOK.",
  ".KOOOONOONOOOOK.",
  ".KOOOOOOOOOOOOK.",
  ".KOOKOOOOOOKOOK.",
  ".KOOKOOOOOOKOOK.",
  ".KOCBCCPPCCBCOK.",
  ".KOOCCCKKCCCOOK.",
  ".KOOOKCCCCKOOOK.",
  "..KOOOOOOOOOOK..",
  "...KKKKKKKKKK...",
  "...KK......KK...",
  "................",
];

// ---- Dog: brown, floppy ears, cream muzzle, red collar ----

const DOG_IDLE: Sprite = [
  "...KKKKKKKKKK...",
  "..KNNNNNNNNNNK..",
  ".KNNNNNNNNNNNNK.",
  "KKNNWNNNNNNNNNKK",
  "KNNKNNNNNNNNKNNK",
  "KNNNCCCCCCCCNNNK",
  "KNNCCCCCCCCCCNNK",
  "KNNCCCCKKCCCCNNK",
  "KNNCCKCCCCKCCNNK",
  "KNNNCCCCCCCCNNNK",
  ".KNNNNNNNNNNNNK.",
  "..KKKKKKKKKKKK..",
  "...KKRRRRRRKK...",
  "....KKKYYKKK....",
  "................",
  "................",
];

const DOG_HAPPY: Sprite = [
  "...KKKKKKKKKK...",
  "..KNNNNNNNNNNK..",
  ".KNNNNNNNNNNNNK.",
  "KKNNWNNNNNNNNNKK",
  "KNNKNNNNNNNNKNNK",
  "KNNNCCCCCCCCNNNK",
  "KNNCCCCCCCCCCNNK",
  "KNNCCCCKKCCCCNNK",
  "KNNCCKCCCCKCCNNK",
  "KNNNCCCCPPCCNNNK",
  ".KNNNNNNPPNNNNK.",
  "..KKKKKKKKKKKK..",
  "...KKRRRRRRKK...",
  "....KKKYYKKK....",
  "................",
  "................",
];

const DOG_HUNGRY: Sprite = [
  "...KKKKKKKKKK...",
  "..KNNNNNNNNNNK..",
  ".KNNNNNNNNNNNNK.",
  "KKNNWNNNNNNNNNKK",
  "KNNKNNNNNNNNKNNK",
  "KNNNCCCCCCCCNNNK",
  "KNNCCCCCCCCCCNNK",
  "KNNCCCCKKCCCCNNK",
  "KNNCCKRRRRKCCNNK",
  "KNNNCCCCCCCCNNNK",
  ".KNNNNNNNNNNNNK.",
  "..KKKKKKKKKKKK..",
  "...KKRRRRRRKK...",
  "....KKKYYKKK....",
  "................",
  "................",
];

const DOG_SLEEPY: Sprite = [
  "...KKKKKKKKKK...",
  "..KNNNNNNNNNNK..",
  ".KNNNNNNNNNNNNK.",
  "KKNNWNNNNNNNNNKK",
  "KNNNNNNNNNNNNNNK",
  "KNNKKCCCCCCKKNNK",
  "KNNCCCCCCCCCCNNK",
  "KNNCCCCKKCCCCNNK",
  "KNNCCCCCCCCCCNNK",
  "KNNNCCCCCCCCNNNK",
  ".KNNNNNNNNNNNNK.",
  "..KKKKKKKKKKKK..",
  "...KKRRRRRRKK...",
  "....KKKYYKKK....",
  "................",
  "................",
];

const DOG_SAD: Sprite = [
  "...KKKKKKKKKK...",
  "..KNNNNNNNNNNK..",
  ".KNNNNNNNNNNNNK.",
  "KKNNWNNNNNNNNNKK",
  "KNNKNNNNNNNNKNNK",
  "KNNNCCCCCCCCNNNK",
  "KNBCCCCCCCCCCBNK",
  "KNNCCCCKKCCCCNNK",
  "KNNCKCCCCCCKCNNK",
  "KNNNCCCCCCCCNNNK",
  ".KNNNNNNNNNNNNK.",
  "..KKKKKKKKKKKK..",
  "...KKRRRRRRKK...",
  "....KKKYYKKK....",
  "................",
  "................",
];

// ---- Bird: green parakeet facing right, dark wing, cream belly ----

const BIRD_IDLE: Sprite = [
  "......KKKKKK....",
  ".....KGGGGGGK...",
  "....KGGGGGGGGK..",
  "...KGGWGGGGGGK..",
  "..KGGGGGGWKGGKOO",
  "..KGGGGGGGGGGGKO",
  "..KDDDDDGGGGGKK.",
  "..KDDCCCCCCCGK..",
  "..KDCCCCCCCCGK..",
  "..KDCCCCCCCCKK..",
  "...KDCCCCCCKK...",
  "...KKCCCCKK.....",
  "....KDDDK.......",
  "....KKKK........",
  "................",
  "................",
];

const BIRD_HAPPY: Sprite = [
  "......KKKKKK....",
  ".....KGGGGGGK...",
  "....KGGGGGGGGK..",
  "...KGGWGGGGGGK..",
  "..KGGGGGGWKGGKOO",
  "..KGPPGGGGGGGGKO",
  "..KDDDDDGGGGGKK.",
  "..KDDCCCCCCCGK..",
  "..KDCCCCCCCCGK..",
  "..KDCCCCCCCCKK..",
  "...KDCCCCCCKK...",
  "...KKCCCCKK.....",
  "....KDDDK.......",
  "....KKKK........",
  "................",
  "................",
];

const BIRD_HUNGRY: Sprite = [
  "......KKKKKK....",
  ".....KGGGGGGK...",
  "....KGGGGGGGGK..",
  "...KGGWGGGGGGK..",
  "..KGGGGGGWKGGKOO",
  "..KGGGGGGGGGGGKR",
  "..KDDDDDGGGGGKK.",
  "..KDDCCCCCCCGK..",
  "..KDCCCCCCCCGK..",
  "..KDCCCCCCCCKK..",
  "...KDCCCCCCKK...",
  "...KKCCCCKK.....",
  "....KDDDK.......",
  "....KKKK........",
  "................",
  "................",
];

const BIRD_SLEEPY: Sprite = [
  "......KKKKKK....",
  ".....KGGGGGGK...",
  "....KGGGGGGGGK..",
  "...KGGWGGGGGGK..",
  "..KGGGGGGKKGGKOO",
  "..KGGGGGGGGGGGKO",
  "..KDDDDDGGGGGKK.",
  "..KDDCCCCCCCGK..",
  "..KDCCCCCCCCGK..",
  "..KDCCCCCCCCKK..",
  "...KDCCCCCCKK...",
  "...KKCCCCKK.....",
  "....KDDDK.......",
  "....KKKK........",
  "................",
  "................",
];

const BIRD_SAD: Sprite = [
  "......KKKKKK....",
  ".....KGGGGGGK...",
  "....KGGGGGGGGK..",
  "...KGGWGGGGGGK..",
  "..KGGGGGGWKGGKOO",
  "..KGGGGGGBGGGGKO",
  "..KDDDDDGGGGGKK.",
  "..KDDCCCCCCCGK..",
  "..KDCCCCCCCCGK..",
  "..KDCCCCCCCCKK..",
  "...KDCCCCCCKK...",
  "...KKCCCCKK.....",
  "....KDDDK.......",
  "....KKKK........",
  "................",
  "................",
];

/** Idle, happy, hungry, sleepy and sad for each pet. */
export const PET_SPRITES: Record<Species, Record<Mood, Sprite>> = {
  cat: { idle: CAT_IDLE, happy: CAT_HAPPY, hungry: CAT_HUNGRY, sleepy: CAT_SLEEPY, sad: CAT_SAD },
  dog: { idle: DOG_IDLE, happy: DOG_HAPPY, hungry: DOG_HUNGRY, sleepy: DOG_SLEEPY, sad: DOG_SAD },
  bird: { idle: BIRD_IDLE, happy: BIRD_HAPPY, hungry: BIRD_HUNGRY, sleepy: BIRD_SLEEPY, sad: BIRD_SAD },
};

/** Cells that take the trumpet-flower blossom after the first rain: [row, column]. */
const BLOSSOM_AT: Record<Species, { full: [number, number][]; low: [number, number][] }> = {
  cat: { full: [[3, 12], [4, 12]], low: [[3, 12]] },
  dog: { full: [[3, 11], [4, 11]], low: [[3, 11]] },
  bird: { full: [[1, 9], [2, 9]], low: [[1, 9]] },
};

// ---- Cartridge icon, food, decor, traffic and action-bar glyphs ----

export const ICON_SPRITE: Sprite = [
  "...KK......KK...",
  "..KGGK....KGGK..",
  "..KGDK....KGDK..",
  "...KKKKKKKKKK...",
  "..KWWNNNNNNNNK..",
  ".KWNNCCCCCCNNNK.",
  ".KNNCCKCCKCCNNK.",
  ".KNNCPCKKCPCNNK.",
  ".KKKKKKKKKKKKKK.",
  ".KWSSSSSSSSSSHK.",
  ".KKKKKKKKKKKKKK.",
  ".KSK..KSK..KSK..",
  ".KSK..KSK..KSK..",
  ".KSK..KSK..KSK..",
  ".KKKKKKKKKKKKKK.",
  "................",
];

export const FOOD_SPRITES: Record<string, Sprite> = {
  idli: [
    "........",
    "..KKKK..",
    ".KWCCCK.",
    ".KCCCNK.",
    "KKKKKKKK",
    "KSSSSSHK",
    ".KKKKKK.",
    "........",
  ],
  kaapi: [
    ".W..W...",
    "..W..W..",
    ".KKKKKK.",
    ".KWSSHK.",
    ".KWSSHK.",
    "KKKKKKKK",
    "KSSSSSHK",
    ".KKKKKK.",
  ],
  dosa: [
    "...KK...",
    "..KYYK..",
    "..KYOK..",
    ".KWYYOK.",
    ".KYYYOK.",
    "KKKKKKKK",
    "KSSSSGHK",
    ".KKKKKK.",
  ],
  chaat: [
    "........",
    "..KKKK..",
    ".KYRYWK.",
    "KYYYYRYK",
    "KKKKKKKK",
    "KGGGGGDK",
    ".KGGGDK.",
    "..KKKK..",
  ],
};

export const DECOR_SPRITES: Record<string, Sprite> = {
  tulsi: [
    ".KK..KK.",
    "KGGKKGDK",
    ".KGDGDK.",
    "..KDDK..",
    "KKKKKKKK",
    "KOOOOORK",
    ".KOOORK.",
    ".KKKKKK.",
  ],
  matka: [
    "..KKKK..",
    "..KOOK..",
    ".KKKKKK.",
    "KWOOOORK",
    "KOOOOORK",
    "KOOOOORK",
    ".KOOORK.",
    "..KKKK..",
  ],
  rangoli: [
    "...KK...",
    "..KYYK..",
    ".KYPPYK.",
    "KYPWWPYK",
    "KYPWWPYK",
    ".KYPPYK.",
    "..KYYK..",
    "...KK...",
  ],
  radio: [
    ".....K..",
    "....K...",
    "KKKKKKKK",
    "KWRRRRMK",
    "KRHHRSMK",
    "KRHHRRMK",
    "KKKKKKKK",
    ".K....K.",
  ],
  bulbs: [
    "KKKKKKKK",
    ".K...K..",
    "KWK.KWK.",
    "KYK.KPK.",
    "KOK.KMK.",
    ".K...K..",
    "........",
    "........",
  ],
  umbrella: [
    "...KK...",
    ".KKRRKK.",
    "KWRRRRMK",
    "KKKKKKKK",
    "....K...",
    "....K...",
    "..K.K...",
    "...K....",
  ],
};

export const BLOSSOM: Sprite = [
  ".KK..KK.",
  "KPPKKPPK",
  "KPWPPPMK",
  ".KPPPMK.",
  "..KPMK..",
  "...KK...",
  "...KGK..",
  "...KKK..",
];

export const BUCKET: Sprite = [
  ".KKKKKK.",
  "KK....KK",
  "KKKKKKKK",
  "KBBBBBVK",
  "KWSSSSHK",
  ".KSSSHK.",
  ".KSSSHK.",
  ".KKKKKK.",
];

export const SCOOTER: Sprite = [
  ".....KK.",
  ".KKK.KBK",
  "KBBBKKBK",
  "KWBBBBBK",
  "KBBBBBVK",
  "KKKKKKKK",
  ".KK..KK.",
  "........",
];

export const AUTO: Sprite = [
  ".KKKKKK.",
  "KWYYYYOK",
  "KGKKWWGK",
  "KGKGGGGK",
  "KGGGGGDK",
  "KKKKKKKK",
  ".KK..KK.",
  "........",
];

export const CAR: Sprite = [
  "..KKKK..",
  ".KWWBBK.",
  "KKKKKKKK",
  "KWCCCCNK",
  "KCCCCCNK",
  "KKKKKKKK",
  ".KK..KK.",
  "........",
];

export const BUS_L: Sprite = [
  ".KKKKKKK",
  "KRRRRRRR",
  "KWKWWKWW",
  "KRRRRRRR",
  "KRRRRRRR",
  "KKKKKKKK",
  ".KK.....",
  "........",
];

export const BUS_R: Sprite = [
  "KKKKKKK.",
  "RRRRRRMK",
  "KWWKWWMK",
  "RRRRRRMK",
  "RRRRRRMK",
  "KKKKKKKK",
  ".....KK.",
  "........",
];

/** Action-bar glyphs that are not in the spec's sprite list (one colour, drawn in currentColor). */
export const ICON_SLEEP: Sprite = [
  "..KKK...",
  ".KK.....",
  "KK......",
  "KK......",
  "KK......",
  ".KK...K.",
  "..KKKKK.",
  "........",
];

export const ICON_VISIT: Sprite = [
  "...KK...",
  "..KKKK..",
  ".KKKKKK.",
  "KKKKKKKK",
  "KK.KK.KK",
  "KK.KK.KK",
  "KKKKKKKK",
  "........",
];

export const mirror = (grid: Sprite): Sprite => grid.map((row) => [...row].reverse().join(""));

const setCell = (grid: Sprite, r: number, c: number, ch: string): Sprite =>
  grid.map((row, i) => (i === r ? row.slice(0, c) + ch + row.slice(c + 1) : row));

/** After the first rain every pet gets a salmon blossom (spec D5). Full moods get two cells, the rest one. */
export function blossomed(grid: Sprite, mood: Mood, species: Species): Sprite {
  const at = mood === "idle" || mood === "happy" ? BLOSSOM_AT[species].full : BLOSSOM_AT[species].low;
  return at.reduce((g, [r, c]) => setCell(g, r, c, "P"), grid);
}
