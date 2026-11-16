"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  SEASONS,
  SEASON_STORAGE_KEY,
  isSeasonId,
  seasonForDate,
  type SeasonId,
  type SeasonPalette,
} from "./seasons";

type ThemeValue = {
  season: SeasonId;
  palette: SeasonPalette;
  /** The season the calendar picks today. */
  calendarSeason: SeasonId;
  /** True when the player has picked a season by hand. */
  pinned: boolean;
  setSeason: (season: SeasonId | null) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({
  initialSeason,
  children,
}: {
  initialSeason: SeasonId;
  children: React.ReactNode;
}) {
  const [calendarSeason, setCalendarSeason] = useState<SeasonId>(initialSeason);
  const [override, setOverride] = useState<SeasonId | null>(null);

  useEffect(() => {
    setCalendarSeason(seasonForDate(new Date()));
    try {
      const saved = localStorage.getItem(SEASON_STORAGE_KEY);
      if (isSeasonId(saved)) setOverride(saved);
    } catch {
      // Storage can be blocked; the calendar season still applies.
    }
  }, []);

  const season = override ?? calendarSeason;

  useEffect(() => {
    document.documentElement.setAttribute("data-season", season);
  }, [season]);

  const setSeason = useCallback((next: SeasonId | null) => {
    setOverride(next);
    try {
      if (next) localStorage.setItem(SEASON_STORAGE_KEY, next);
      else localStorage.removeItem(SEASON_STORAGE_KEY);
    } catch {
      // Not saved; it still applies for this visit.
    }
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({
      season,
      palette: SEASONS[season],
      calendarSeason,
      pinned: override !== null,
      setSeason,
    }),
    [season, calendarSeason, override, setSeason]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
