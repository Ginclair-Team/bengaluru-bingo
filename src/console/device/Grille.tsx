import { box } from "./units";

/** The speaker grille: a 5 x 5 array of holes. A cartridge lights them however it likes. */
export function Grille({ mask }: { mask: number }) {
  return (
    <div className="grille" style={box(284, 576, 32, 32)} aria-hidden="true">
      {Array.from({ length: 25 }, (_, i) => (
        <i key={i} data-on={((mask >> i) & 1) === 1} />
      ))}
    </div>
  );
}
