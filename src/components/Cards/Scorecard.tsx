import type { Score } from "@/lib/game";
import type { SeasonId } from "@/theme/seasons";
import { scorecardSvg } from "./scorecardSvg";

const PAGE_FONTS = { display: "var(--font-display)", mono: "var(--font-mono)" };

/** The trading-card scorecard, inline so it uses the page's fonts. */
export function Scorecard({
  score,
  season,
  title,
  className,
}: {
  score: Score;
  season: SeasonId;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: scorecardSvg(score, season, PAGE_FONTS, { title }) }}
    />
  );
}
