import { TILE_ART, tileSvg } from "./art";

/**
 * Draws a tile's character.
 *
 * Every character is a hand-drawn 16x16 pixel sprite from ./art.ts (one
 * character per pixel, one shared palette). This component is the single slot
 * for swapping in generated art later: pass `src` and the image is used
 * instead of the built-in sprite.
 *
 * Prompt structure for generating a replacement character (keep every
 * bracketed part, change only the subject and prop):
 *
 *   "16x16 pixel art sprite of [a friendly Bengaluru elephant] [holding a
 *    crockpot], single character, front view, hard pixels with no
 *    anti-aliasing, closed 1px near-black (#1A1C2C) outline, at most one
 *    highlight and one shadow per colour area, light from the top-left, two
 *    single-pixel eyes and a 2px mouth, limited palette (#1A1C2C ink,
 *    #FFFFFF, #FFE9C4, #FFD23F, #FF8A3D, #E5383B, #FF6FB5, #C2185B, #8E5BD9,
 *    #3D8BFD, #23C4C4, #3CC47C, #1E7A4C, #A0623A, #B8C4CC, #6B7A86),
 *    transparent background, centred, one empty row at the bottom, no text,
 *    no gradients, no drop shadow."
 */
export function BingoCardIllustrator({
  id,
  src,
  className,
}: {
  id: string;
  /** Optional generated image that replaces the built-in sprite. */
  src?: string;
  className?: string;
  /** @deprecated Sprites have no stroke. Accepted for compatibility and ignored. */
  strokeWidth?: number;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} loading="lazy" decoding="async" />;
  }
  if (!(id in TILE_ART)) return <span className={className} aria-hidden="true" />;
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: tileSvg(id) }} />;
}
