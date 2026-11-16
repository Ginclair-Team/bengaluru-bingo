import { decodeMarks, encodeMarks, type Marks } from "./game";

// Everything the game remembers lives in this browser: a random anonymous id
// and the stamped tiles. No names, no phone numbers.

const KEY = "bb:v1";

type Saved = { anonymousId: string; code: string };

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

export function loadGame(): { anonymousId: string; marks: Marks } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Saved>;
      const marks = typeof saved.code === "string" ? decodeMarks(saved.code) : null;
      if (typeof saved.anonymousId === "string") {
        return { anonymousId: saved.anonymousId, marks: marks ?? 0 };
      }
    }
  } catch {
    // Fall through to a fresh card.
  }
  return { anonymousId: newId(), marks: 0 };
}

export function saveGame(anonymousId: string, marks: Marks): void {
  try {
    const saved: Saved = { anonymousId, code: encodeMarks(marks) };
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Storage is blocked or full; the round still works until the tab closes.
  }
}
