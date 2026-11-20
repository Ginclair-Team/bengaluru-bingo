import type { Cartridge } from "@/console/types";
import { ICON } from "./art";
import { CART } from "./data";
import { GigHuntGame } from "./GigHuntGame";

/** Cartridge 4: Gig Hunt, three weeks to land a first gig from a PG room. */
export const gigHunt: Cartridge = {
  id: "gig-hunt",
  title: CART.title,
  tagline: CART.tagline,
  sticker: CART.sticker,
  icon: ICON,
  legends: { a: "NEW RUN", b: "" },
  lede: CART.lede,
  hint: CART.hint,
  status: "ready",
  Game: GigHuntGame,
};
