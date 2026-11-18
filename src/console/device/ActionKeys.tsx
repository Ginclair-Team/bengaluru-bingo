"use client";

import type { Key } from "./controls";
import { HwKey } from "./HwKey";
import { u } from "./units";

function ABKey({
  id,
  letter,
  cx,
  cy,
  pressed,
  onPress,
}: {
  id: "a" | "b";
  letter: string;
  cx: number;
  cy: number;
  pressed: boolean;
  onPress: (key: Key) => void;
}) {
  return (
    <HwKey
      id={id}
      pressed={pressed}
      onPress={onPress}
      className="key-ab"
      style={{ left: u(cx - 26), top: u(cy - 26), width: u(52), height: u(58) }}
    >
      <span className="wall" aria-hidden="true" />
      <span className="face" aria-hidden="true">
        {letter}
      </span>
    </HwKey>
  );
}

/**
 * B then A, in tab order (B is on the lower left). The legends under them
 * come from the inserted cartridge, so each game can name its own actions.
 */
export function ActionKeys({
  pressed,
  onPress,
  legends,
}: {
  pressed: Partial<Record<Key, boolean>>;
  onPress: (key: Key) => void;
  legends: { a: string; b: string };
}) {
  return (
    <>
      <ABKey id="b" letter="B" cx={232} cy={524} pressed={!!pressed.b} onPress={onPress} />
      <ABKey id="a" letter="A" cx={292} cy={484} pressed={!!pressed.a} onPress={onPress} />
      {legends.a && (
        <span className="shell-legend t-ui-s" style={{ left: u(268), top: u(520) }} aria-hidden="true">
          {legends.a}
        </span>
      )}
      {legends.b && (
        <span className="shell-legend t-ui-s" style={{ left: u(238), top: u(560) }} aria-hidden="true">
          {legends.b}
        </span>
      )}
    </>
  );
}
