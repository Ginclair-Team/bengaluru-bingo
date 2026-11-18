import type { ReactNode } from "react";
import { PowerLed } from "./PowerLed";

/**
 * The device's bezel on its own, used to present a scorecard (or the 404) off
 * the console. Server-compatible.
 */
export function ScreenFrame({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`screen-frame ${className}`} role={label ? "group" : undefined} aria-label={label}>
      <div className="screen-frame__strip" aria-hidden="true">
        <PowerLed on />
        <span>PWR</span>
        <span className="screen-frame__name" style={{ marginLeft: "auto", marginRight: "auto" }}>BENGALURU POCKET</span>
        <span style={{ width: 24 }} />
      </div>
      <div className="screen-frame__lcd">{children}</div>
    </div>
  );
}
