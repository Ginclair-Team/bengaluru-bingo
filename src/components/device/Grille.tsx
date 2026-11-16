import { TILE_COUNT, isMarked, type Marks } from "@/lib/game";
import { box } from "./units";

/** The speaker grille: a live 5 x 5 map of the stamped tiles. */
export function Grille({ marks }: { marks: Marks }) {
  return (
    <div className="grille" style={box(284, 576, 32, 32)} aria-hidden="true">
      {Array.from({ length: TILE_COUNT }, (_, i) => (
        <i key={i} data-on={isMarked(marks, i)} />
      ))}
    </div>
  );
}
