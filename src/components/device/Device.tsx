"use client";

import type { ReactNode } from "react";
import { SoundOffIcon, SoundOnIcon } from "@/components/icons";
import type { Marks } from "@/lib/game";
import { ActionKeys } from "./ActionKeys";
import type { Key } from "./controls";
import { DPad } from "./DPad";
import { Grille } from "./Grille";
import { PowerLed } from "./PowerLed";
import { SystemKeys } from "./SystemKeys";
import { box, u } from "./units";

/**
 * The GINHOUSE POCKET GH-25. Everything is laid out in device units (1u =
 * device width / 344), so the whole console scales as one object.
 *
 * DOM order is the tab order: sound toggle, LCD, D-pad, B, A, SELECT, START.
 */
export function Device({
  children,
  pressed,
  onPress,
  muted,
  onToggleMute,
  ledOn,
  ledBlink,
  marks,
}: {
  /** The LCD (a <Screen>). */
  children: ReactNode;
  pressed: Partial<Record<Key, boolean>>;
  onPress: (key: Key) => void;
  muted: boolean;
  onToggleMute: () => void;
  ledOn: boolean;
  ledBlink: boolean;
  marks: Marks;
}) {
  return (
    <div className="device" id="game">
      <div className="notch" style={box(20, 0, 28, 6)} aria-hidden="true" />

      {/* Bezel and its two strips */}
      <div className="bezel" style={box(14, 14, 316, 416)} aria-hidden="true" />
      <div className="bezel-text" style={{ left: u(28), top: u(22), height: u(6), gap: u(4) }} aria-hidden="true">
        <PowerLed on={ledOn} pulse blink={ledBlink} />
      </div>
      <span className="bezel-text t-ui-s" style={{ left: u(38), top: u(22), height: u(6) }} aria-hidden="true">
        PWR
      </span>
      <span
        className="bezel-text t-ui-s"
        style={{ left: u(172), top: u(25), transform: "translate(-50%, -50%)" }}
        aria-hidden="true"
      >
        GINHOUSE POCKET
      </span>

      <button
        type="button"
        className="sound-toggle"
        aria-label="Sound and haptics"
        aria-pressed={!muted}
        aria-keyshortcuts="M"
        onClick={onToggleMute}
        style={{
          left: u(306),
          top: u(25),
          width: "max(44px, calc(44 * var(--u)))",
          height: "max(44px, calc(44 * var(--u)))",
          transform: "translate(-50%, -50%)",
          zIndex: 5,
        }}
      >
        {muted ? <SoundOffIcon className="ico" /> : <SoundOnIcon className="ico" />}
      </button>

      {/* The LCD */}
      <div style={box(26, 36, 292, 368)}>{children}</div>

      <div
        className="sticker t-ui-s"
        style={{ left: u(97), top: u(409), width: u(150), height: u(16) }}
        aria-hidden="true"
      >
        BENGALURU BINGO
      </div>
      <span
        className="bezel-text t-ui-s"
        style={{ right: u(26), top: u(417), transform: "translateY(-50%)" }}
        aria-hidden="true"
      >
        GH-25
      </span>

      {/* Controls */}
      <DPad pressed={pressed} onPress={onPress} />
      <ActionKeys pressed={pressed} onPress={onPress} />
      <SystemKeys pressed={pressed} onPress={onPress} />
      <Grille marks={marks} />
    </div>
  );
}
