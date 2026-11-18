"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { HAPTIC, unlockAudio, vibrate } from "@/lib/sound";
import { KEY_LABELS, type Key } from "./controls";

/**
 * A real <button> that looks like a hardware key. It presses on pointerdown
 * (and when the matching keyboard key is used, via `pressed`) and acts on
 * click, so native keyboard activation and screen readers keep working.
 */
export function HwKey({
  id,
  pressed = false,
  onPress,
  repeat = false,
  className,
  style,
  children,
}: {
  id: Key;
  pressed?: boolean;
  onPress: (key: Key) => void;
  /** Hold to repeat: after 300ms, every 120ms. */
  repeat?: boolean;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [down, setDown] = useState(false);
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeated = useRef(false);

  const stop = useCallback(() => {
    if (delay.current) clearTimeout(delay.current);
    if (timer.current) clearInterval(timer.current);
    delay.current = null;
    timer.current = null;
    setDown(false);
  }, []);

  useEffect(() => stop, [stop]);

  const info = KEY_LABELS[id];

  return (
    <button
      type="button"
      className={`hw ${className}`}
      style={style}
      aria-label={info.label}
      aria-keyshortcuts={info.shortcuts}
      data-hw-key={id}
      data-down={down || pressed}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        unlockAudio();
        vibrate(HAPTIC.key);
        setDown(true);
        repeated.current = false;
        if (repeat) {
          delay.current = setTimeout(() => {
            repeated.current = true;
            onPress(id);
            timer.current = setInterval(() => onPress(id), 120);
          }, 300);
        }
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      onBlur={stop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setDown(true);
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") setDown(false);
      }}
      onClick={() => {
        // A held D-pad arm already repeated; swallow the click that ends it.
        if (repeated.current) {
          repeated.current = false;
          return;
        }
        onPress(id);
      }}
    >
      {children}
    </button>
  );
}
