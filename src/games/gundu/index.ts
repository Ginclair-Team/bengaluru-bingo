import type { Cartridge } from "@/console/types";
import { HINT, LEDE, STICKER, TAGLINE, TITLE } from "./data";
import { GunduGame } from "./GunduGame";
import { ICON_SPRITE } from "./sprites";

/** Cartridge 3: Gundu, a balcony pet that keeps Bengaluru time. */
export const gundu: Cartridge = {
  id: "gundu",
  title: TITLE,
  tagline: TAGLINE,
  sticker: STICKER,
  icon: ICON_SPRITE,
  legends: { a: "", b: "" },
  lede: LEDE,
  hint: HINT,
  status: "ready",
  Game: GunduGame,
};
