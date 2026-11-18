import { bingo } from "@/games/bingo";
import { whichSide } from "@/games/which-side";
import type { Cartridge } from "./types";

/**
 * Every cartridge in Bengaluru Pocket, in menu order.
 * To add a game: build it under src/games/<id>/, export a Cartridge, and list it here.
 */
export const CARTRIDGES: Cartridge[] = [bingo, whichSide];

/** The playable cartridge with this id, or null. */
export function playable(id: string | null): Cartridge | null {
  return CARTRIDGES.find((cartridge) => cartridge.id === id && cartridge.status === "ready") ?? null;
}
