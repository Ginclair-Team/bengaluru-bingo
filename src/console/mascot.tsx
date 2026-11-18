import { BingoCardIllustrator } from "@/games/bingo/illustrator";

/**
 * The console's mascot. For now it borrows the elephant from the tile art, so
 * the console and the game share one drawing. A console-owned sprite can
 * replace it here without touching any game.
 */
export function Mascot({ className }: { className?: string }) {
  return <BingoCardIllustrator id="elephant" className={className} />;
}
