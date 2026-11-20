import { bingo } from "@/games/bingo";
import { gigHunt } from "@/games/gig-hunt";
import { gundu } from "@/games/gundu";
import { whichSide } from "@/games/which-side";
import type { Cartridge } from "./types";

/**
 * Every cartridge in Bengaluru Pocket, in menu order.
 * To add a game: build it under src/games/<id>/, export a Cartridge, and list it here.
 */
export const CARTRIDGES: Cartridge[] = [bingo, whichSide, gundu, gigHunt];

/** The playable cartridge with this id, or null. */
export function playable(id: string | null): Cartridge | null {
  return CARTRIDGES.find((cartridge) => cartridge.id === id && cartridge.status === "ready") ?? null;
}
