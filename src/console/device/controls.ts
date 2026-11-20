export type Key = "up" | "down" | "left" | "right" | "a" | "b" | "continue" | "menu";

export const KEY_LABELS: Record<Key, { label: string; shortcuts: string }> = {
  up: { label: "D-pad up", shortcuts: "ArrowUp W" },
  down: { label: "D-pad down", shortcuts: "ArrowDown S" },
  left: { label: "D-pad left", shortcuts: "ArrowLeft A" },
  right: { label: "D-pad right", shortcuts: "ArrowRight D" },
  a: { label: "A: select", shortcuts: "Z Space" },
  b: { label: "B: back", shortcuts: "X Backspace Escape" },
  continue: { label: "Continue: go on", shortcuts: "Enter" },
  menu: { label: "Menu: pause menu", shortcuts: "Shift" },
};

/** Keyboard to console key. Letters are matched lower-case. */
export const KEYMAP: Record<string, Key> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  z: "a",
  " ": "a",
  x: "b",
  Backspace: "b",
  Escape: "b",
  Enter: "continue",
};

/** The manual: shown on the desk (desktop) and in every How to play. */
export const CONTROLS: { keys: string[]; action: string }[] = [
  { keys: ["Arrows", "WASD"], action: "Move the cursor or the selection" },
  { keys: ["Z", "Space"], action: "A: select, stamp or confirm" },
  { keys: ["X", "Esc", "Back"], action: "B: go back or undo" },
  { keys: ["Enter"], action: "CONTINUE: go on, or see your score" },
  { keys: ["Shift"], action: "MENU: pause menu" },
  { keys: ["M"], action: "Sound and haptics on or off" },
];
