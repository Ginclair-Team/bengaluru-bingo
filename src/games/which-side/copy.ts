import type { Zone } from "./data";

export const TITLE = "Which Side";
export const TAGLINE = "Guess the zone from the jam";
export const STICKER = "WHICH SIDE MACHA";
export const LEDE =
  "Five landmarks, one clue each: how long the evening drive from MG Road takes. Name the zone before the signal turns green.";
export const HINT = "Pick a zone with the D-pad and press A to lock it in.";
export const INTRO = "MG ROAD, 6 PM. HOW FAR IS IT? GUESS THE ZONE.";
export const ROUND_PROMPT = "WHICH SIDE, MACHA?";
export const CORRECT_LINE = "CORRECT! YOU KNOW YOUR CITY";
export const WRONG_LINE = "NO MACHA, THAT'S {ZONE}";
export const RESULT_PERFECT = "PUCCA LOCAL, MACHA!";
export const RESULT_GOOD = "NOT BAD, YOU KNOW THE ROUTES";
export const RESULT_LOW = "STILL USING MAPS, AH?";
export const RESULT_ZERO = "NEW TO NAMMA OORU?";
export const SHARE_TEMPLATE = "I got {score}/5 on Which Side, Macha? My side: {zone}. Play it on Bengaluru Pocket.";
export const NO_ZONE = "NONE YET";

export const ZONE_DESCRIPTIONS: Record<Zone, string> = {
  CENTRAL: "MG Road, the CBD and the old cantonment",
  NORTH: "Hebbal, tech parks and the airport road",
  EAST: "Indiranagar, ORR and the IT corridor",
  SOUTH: "Basavanagudi, Jayanagar and Silk Board",
  WEST: "The old pete, Rajajinagar and beyond",
};

// Not in the spec: UI strings written for this cartridge.
export const CLUE_PREFIX = "FROM MG ROAD, EVENINGS:";
export const HOW_TO_PLAY =
  "Each round shows a landmark and how long the evening drive from MG Road takes. Pick the zone it sits in. Five rounds per run.";
