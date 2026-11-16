"use client";

import { ArrowIcon } from "@/components/icons";
import type { Key } from "./controls";
import { HwKey } from "./HwKey";
import { box, u } from "./units";

const ARMS: { id: "up" | "down" | "left" | "right"; x: number; y: number }[] = [
  { id: "up", x: 44, y: 0 },
  { id: "left", x: 0, y: 44 },
  { id: "right", x: 88, y: 44 },
  { id: "down", x: 44, y: 88 },
];

/** The disc D-pad: four real buttons on a dark disc. Hold an arm to repeat. */
export function DPad({
  pressed,
  onPress,
}: {
  pressed: Partial<Record<Key, boolean>>;
  onPress: (key: Key) => void;
}) {
  return (
    <div className="dpad" style={box(16, 442, 132, 132)} role="group" aria-label="D-pad">
      <div className="dpad-centre" aria-hidden="true" />
      {ARMS.map((arm) => (
        <HwKey
          key={arm.id}
          id={arm.id}
          repeat
          pressed={!!pressed[arm.id]}
          onPress={onPress}
          className="dpad-arm"
          style={{ left: u(arm.x), top: u(arm.y) }}
        >
          <ArrowIcon dir={arm.id} className="ico" />
        </HwKey>
      ))}
    </div>
  );
}
