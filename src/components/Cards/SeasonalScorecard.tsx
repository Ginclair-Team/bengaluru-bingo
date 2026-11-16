"use client";

import { scoreFor, type Marks } from "@/lib/game";
import { useTheme } from "@/theme/context";
import { Scorecard } from "./Scorecard";

/** A scorecard that follows the viewer's current season. */
export function SeasonalScorecard({ marks, title }: { marks: Marks; title?: string }) {
  const { season } = useTheme();
  return <Scorecard score={scoreFor(marks)} season={season} title={title} className="scorecard" />;
}
