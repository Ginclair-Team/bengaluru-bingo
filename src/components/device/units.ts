import type { CSSProperties } from "react";

/** n device units as a CSS length. 1u = device width / 344. */
export const u = (n: number): string => `calc(${n} * var(--u))`;

/** An absolutely positioned box in device units. */
export const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: u(x),
  top: u(y),
  width: u(w),
  height: u(h),
});
