"use client";

import type { Key } from "./controls";
import { HwKey } from "./HwKey";
import { u } from "./units";

function PillKey({
  id,
  cx,
  pressed,
  onPress,
}: {
  id: "menu" | "continue";
  cx: number;
  pressed: boolean;
  onPress: (key: Key) => void;
}) {
  return (
    <HwKey
      id={id}
      pressed={pressed}
      onPress={onPress}
      className="key-pill"
      style={{
        left: u(cx),
        top: u(600),
        width: u(56),
        height: "max(44px, calc(44 * var(--u)))",
        transform: "translate(-50%, -50%)",
      }}
    >
      <span className="wall" aria-hidden="true" />
      <span className="face" aria-hidden="true" />
    </HwKey>
  );
}

export function SystemKeys({
  pressed,
  onPress,
}: {
  pressed: Partial<Record<Key, boolean>>;
  onPress: (key: Key) => void;
}) {
  return (
    <>
      <PillKey id="menu" cx={136} pressed={!!pressed.menu} onPress={onPress} />
      <PillKey id="continue" cx={208} pressed={!!pressed.continue} onPress={onPress} />
      <span
        className="shell-legend t-ui-s"
        style={{ left: u(136), top: u(576), transform: "translateX(-50%)" }}
        aria-hidden="true"
      >
        MENU
      </span>
      <span
        className="shell-legend t-ui-s"
        style={{ left: u(208), top: u(576), transform: "translateX(-50%)" }}
        aria-hidden="true"
      >
        CONTINUE
      </span>
    </>
  );
}
