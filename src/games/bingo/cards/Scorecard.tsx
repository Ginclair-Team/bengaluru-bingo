import type { Score } from "@/games/bingo/rules";
import { scorecardSvg } from "./scorecardSvg";

const PAGE_FONTS = {
  display: "var(--font-display)",
  label: "var(--font-label)",
  body: "var(--font-body)",
};

/** The pixel trading-card scorecard, inline so it uses the page's fonts. */
export function Scorecard({
  score,
  title,
  className,
}: {
  score: Score;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: scorecardSvg(score, PAGE_FONTS, { title }) }}
    />
  );
}
