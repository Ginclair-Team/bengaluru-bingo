"use client";

import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import type { Key } from "./device/controls";
import type { ConsoleHost } from "./types";

export type KeyListener = (key: Key) => void;

export type ConsoleContextValue = {
  host: ConsoleHost;
  /** The LCD element. Focus queries stay inside it. */
  lcd: RefObject<HTMLDivElement>;
  /** The desk column beside the console, for a cartridge's side panels. */
  side: HTMLElement | null;
  /** Subscribe to console keys. Returns the unsubscribe function. */
  subscribe: (listener: KeyListener) => () => void;
};

export const ConsoleContext = createContext<ConsoleContextValue | null>(null);

function useConsoleContext(): ConsoleContextValue {
  const value = useContext(ConsoleContext);
  if (!value) throw new Error("Cartridges must render inside the Bengaluru Pocket console.");
  return value;
}

/** Everything a cartridge needs from the console. */
export function useCartridge() {
  const { host, lcd, side } = useConsoleContext();
  return { host, lcd, side };
}

/**
 * Receive the console's keys while mounted. Keys arrive from the D-pad, A, B,
 * START, SELECT and the keyboard. The latest handler is always the one called.
 */
export function useConsoleKeys(handler: KeyListener) {
  const { subscribe } = useConsoleContext();
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => subscribe((key) => latest.current(key)), [subscribe]);
}
