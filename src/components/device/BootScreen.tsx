"use client";

import { useEffect, useRef, useState } from "react";
import { BingoCardIllustrator } from "@/components/BingoCardIllustrator";
import { audioUnlocked, play } from "@/lib/sound";

const WORD = "GINHOUSE";

/**
 * Boot, 1400ms: LED on at 150, GINHOUSE types on from 250 (one letter per
 * 80ms), POCKET GH-25 and the elephant at 900, wipe to the board at 1400.
 * Any key, button or tap skips (the Game skips; a tap here does too).
 */
export function BootScreen({
  onLed,
  onDone,
}: {
  onLed: () => void;
  onDone: () => void;
}) {
  const [letters, setLetters] = useState(0);
  const [showSub, setShowSub] = useState(false);
  const done = useRef(onDone);
  const led = useRef(onLed);
  done.current = onDone;
  led.current = onLed;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => led.current(), 150));
    for (let i = 0; i < WORD.length; i++) {
      timers.push(
        setTimeout(() => {
          setLetters(i + 1);
          if (audioUnlocked()) play("tick");
        }, 250 + i * 80)
      );
    }
    timers.push(
      setTimeout(() => {
        setShowSub(true);
        if (audioUnlocked()) play("chime");
      }, 900)
    );
    timers.push(setTimeout(() => done.current(), 1400));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="boot" aria-hidden="true" onPointerDown={() => done.current()}>
      <div style={{ height: "calc(64 * var(--u))" }}>
        {showSub && <BingoCardIllustrator id="elephant" className="spr boot-elephant" />}
      </div>
      <div className="boot-word">
        {WORD.slice(0, letters)}
        <span className="boot-cursor" />
      </div>
      <div className="t-ui-s" style={{ height: "1em", visibility: showSub ? "visible" : "hidden" }}>
        POCKET GH-25
      </div>
    </div>
  );
}
