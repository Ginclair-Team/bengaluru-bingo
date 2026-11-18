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
 *    anti-aliasing, closed 1px espresso (#2E1F18) outline, at most one
 *    highlight and one shadow per colour area, light from the top-left, two
 *    single-pixel eyes and a 2px mouth, limited warm palette (#2E1F18 ink,
 *    #FFF9F0, #F6E3C8, #F2C14E, #E8894F, #D4513F, #F59A86, #A93D29, #8C6A94,
 *    #7598B5, #74AFA4, #86B26A, #4F7A46, #9A6440, #CDC2B5, #8A7B6C),
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
