import { scoreFor, type Marks } from "@/lib/game";
import { Scorecard } from "./Scorecard";

/** A plain scorecard for a set of marks. No theme, no client state. */
export function CardScorecard({
  marks,
  title,
  className,
}: {
  marks: Marks;
  title?: string;
  className?: string;
}) {
  return <Scorecard score={scoreFor(marks)} title={title} className={className} />;
}
