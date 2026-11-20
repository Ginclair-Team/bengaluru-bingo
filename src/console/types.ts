import type { ComponentType } from "react";
import type { Sprite } from "@/lib/pixel";

export type { Key } from "./device/controls";

/** The words printed under the A and B keys. An empty word prints nothing. */
export type Legends = { a: string; b: string };

/** What the console gives every cartridge. Reach it with useCartridge(). */
export type ConsoleHost = {
  /** Sound and haptics are off. */
  muted: boolean;
  toggleSound: () => void;
  /** Leave the game and go back to the home menu. */
  exit: () => void;
  /**
   * Change the LCD screen with the eight-blind wipe. `change` runs at the
   * midpoint of the wipe (instantly under reduced motion). Keys are ignored
   * until the wipe ends.
   */
  transition: (change: () => void) => void;
  /** Speak a message to screen readers. */
  announce: (message: string) => void;
  /** Blink the power LED for about a second. */
  flashLed: () => void;
  /** Light the speaker grille. Bit i lights hole i (0 to 24, row by row). */
  setGrille: (mask: number) => void;
  /**
   * Name what A and B do on the screen that is showing now. Call it when the
   * screen changes, and keep each word to 8 characters or fewer. The menu
   * and each cartridge set their own; the cartridge's `legends` are only the
   * starting words.
   */
  setLegends: (legends: Legends) => void;
};

/**
 * One game on a cartridge. The console owns the hardware, the boot, the
 * menu and the wipe; the cartridge owns its rules, its screens and its own
 * pause and help dialogs.
 */
export type Cartridge = {
  /** URL slug (`/?g=<id>`) and storage namespace. Lower case, no spaces. */
  id: string;
  /** Menu title. */
  title: string;
  /** Second line on the menu. */
  tagline: string;
  /** Label sticker printed on the console. 16 characters at most. */
  sticker: string;
  /** 16 x 16 pixel icon for the menu. */
  icon: Sprite;
  /** Starting legends under A and B, until the game sets its screen's own. */
  legends: Legends;
  /** Desk text beside the console, on desktop. */
  lede: string;
  /** Text under the console, on phones. */
  hint: string;
  /** "ready" cartridges can be played. "soon" ones are listed but locked. */
  status: "ready" | "soon";
  /** The game itself. Rendered inside the LCD. */
  Game: ComponentType;
};
