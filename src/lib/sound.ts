// Square-wave blips and haptics for the pocket console. No audio files: every
// sound is an oscillator. Nothing plays before a user gesture, and nothing
// plays when muted. Every call is wrapped so audio can never break the game.

export type Sfx =
  | "move"
  | "stamp"
  | "lift"
  | "error"
  | "open"
  | "close"
  | "screen"
  | "bingo"
  | "chime"
  | "tick";

type Note = [freq: number, ms: number];

const TABLE: Record<Sfx, Note[]> = {
  move: [[660, 30]],
  stamp: [[523, 50], [784, 50]],
  lift: [[392, 50], [262, 50]],
  error: [[110, 80]],
  open: [[440, 40], [660, 40]],
  close: [[660, 40], [440, 40]],
  screen: [[330, 40], [494, 40], [660, 40]],
  bingo: [[523, 70], [659, 70], [784, 70], [1047, 70], [1319, 70]],
  chime: [[784, 90], [1175, 90]],
  tick: [[880, 24]],
};

const KEY = "bb:sound";
const GAIN = 0.05;

let muted = false;
let ctx: AudioContext | null = null;
let unlocked = false;

export function loadMuted(): boolean {
  try {
    muted = localStorage.getItem(KEY) === "off";
  } catch {
    muted = false;
  }
  return muted;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? "off" : "on");
  } catch {
    // Storage blocked: the choice lasts until the tab closes.
  }
}

/** Create the shared AudioContext. Call from a user gesture. */
export function unlockAudio(): void {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    unlocked = true;
  } catch {
    // No audio here; the game stays silent.
  }
}

export function audioUnlocked(): boolean {
  return unlocked && ctx !== null;
}

export function play(sfx: Sfx): void {
  if (muted || !ctx || !unlocked) return;
  try {
    if (ctx.state === "suspended") void ctx.resume();
    let t = ctx.currentTime + 0.005;
    for (const [freq, ms] of TABLE[sfx]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const dur = ms / 1000;
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(GAIN, t);
      gain.gain.setValueAtTime(GAIN, t + dur * 0.8);
      gain.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.01);
      t += dur;
    }
  } catch {
    // Ignore audio failures.
  }
}

export function vibrate(pattern: number | number[]): void {
  if (muted) return;
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    // Not supported or blocked.
  }
}

export const HAPTIC = {
  key: 8,
  stamp: 15,
  lift: 8,
  bingo: [20, 40, 20, 40, 60] as number[],
};
