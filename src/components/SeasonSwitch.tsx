"use client";

import { useTheme } from "@/theme/context";
import { SEASONS, SEASON_ORDER } from "@/theme/seasons";

/** Four ink swatches. The calendar picks one; the player can pin another. */
export function SeasonSwitch() {
  const { season, calendarSeason, setSeason } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-semibold sm:inline" aria-hidden="true">
        {SEASONS[season].label}
      </span>
      <div role="radiogroup" aria-label="Season palette" className="flex">
        {SEASON_ORDER.map((id) => {
          const active = id === season;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${SEASONS[id].label}, ${SEASONS[id].months}${id === calendarSeason ? " (now)" : ""}`}
              title={SEASONS[id].label}
              onClick={() => setSeason(id === calendarSeason ? null : id)}
              className="grid h-11 w-9 place-items-center"
            >
              <span
                className="block rounded-full border-[3px] border-black transition-[width,height] duration-200"
                style={{
                  background: SEASONS[id].board,
                  width: active ? 26 : 16,
                  height: active ? 26 : 16,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
