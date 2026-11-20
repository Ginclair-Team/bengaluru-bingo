import type { Cartridge } from "@/console/types";
import { BingoGame } from "./BingoGame";
import { TILE_ART } from "./illustrator/art";

/** Cartridge 1: Bengaluru Bingo. Stamp 25 things you've done in the city, then flip for your score. */
export const bingo: Cartridge = {
  id: "bingo",
  title: "Bingo",
  tagline: "Stamp your city. 25 tiles.",
  sticker: "BENGALURU BINGO",
  icon: TILE_ART.dosa,
  legends: { a: "STAMP", b: "" },
  lede: "Stamp everything you've actually done in Bengaluru. Press CONTINUE to see how native you are, then post your card.",
  hint: "Tap a tile or use the buttons. CONTINUE shows your score.",
  status: "ready",
  Game: BingoGame,
};
