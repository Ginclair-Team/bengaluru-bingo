import type { Cartridge } from "@/console/types";
import { HINT, LEDE, STICKER, TAGLINE, TITLE } from "./copy";
import { ICON_SPRITE } from "./sprites";
import { WhichSideGame } from "./WhichSideGame";

/** Cartridge 2: Which Side, Macha? Guess the zone from the evening drive time. */
export const whichSide: Cartridge = {
  id: "which-side",
  title: TITLE,
  tagline: TAGLINE,
  sticker: STICKER,
  icon: ICON_SPRITE,
  legends: { a: "START", b: "MENU" },
  lede: LEDE,
  hint: HINT,
  status: "ready",
  Game: WhichSideGame,
};
