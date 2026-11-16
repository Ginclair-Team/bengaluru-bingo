export type Key = "up" | "down" | "left" | "right" | "a" | "b" | "start" | "select";

export const KEY_LABELS: Record<Key, { label: string; shortcuts: string }> = {
  up: { label: "D-pad up", shortcuts: "ArrowUp W" },
  down: { label: "D-pad down", shortcuts: "ArrowDown S" },
  left: { label: "D-pad left", shortcuts: "ArrowLeft A" },
  right: { label: "D-pad right", shortcuts: "ArrowRight D" },
  a: { label: "A: stamp", shortcuts: "Z Space" },
  b: { label: "B: back", shortcuts: "X Backspace Escape" },
  start: { label: "Start: show scorecard", shortcuts: "Enter" },
  select: { label: "Select: menu", shortcuts: "Shift" },
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
  Enter: "start",
};

/** The manual: shown on the desk (desktop) and in HOW TO PLAY. */
export const CONTROLS: { keys: string[]; action: string }[] = [
  { keys: ["Arrows", "WASD"], action: "Move the cursor" },
  { keys: ["Z", "Space"], action: "Stamp or lift the tile (A)" },
  { keys: ["X", "Esc", "Back"], action: "Go back, or lift a stamp (B)" },
  { keys: ["Enter"], action: "Your scorecard (START)" },
  { keys: ["Shift"], action: "Menu (SELECT)" },
  { keys: ["M"], action: "Sound and haptics on or off" },
];
