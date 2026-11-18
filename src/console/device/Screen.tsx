"use client";

import { forwardRef, type ReactNode } from "react";

export type WipePhase = "close" | "open" | null;

/** The LCD: paper, scanlines, and the eight-blind wipe between screens. */
export const Screen = forwardRef<
  HTMLDivElement,
  { children?: ReactNode; off?: boolean; wipe?: WipePhase }
>(function Screen({ children, off = false, wipe = null }, ref) {
  return (
    <div ref={ref} className="lcd" data-off={off}>
      {children}
      {wipe && (
        <div className="wipe" data-phase={wipe} aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      )}
      <div className="lcd-scan" aria-hidden="true" />
    </div>
  );
});

/** Title left, card code right, for every screen except the board. */
export function LcdHeader({ title, code }: { title: string; code?: string }) {
  return (
    <div className="lcd-header t-ui-s">
      <span>{title}</span>
      {code && <span>NO.{code.toUpperCase()}</span>}
    </div>
  );
}
