import { TILE_ART, tileSvg } from "./art";

/**
 * Draws a tile's character.
 *
 * Today every character is hand-drawn SVG from ./art.ts. This component is
 * the single slot for swapping in generated art later: pass `src` and the
 * image is used instead of the built-in drawing.
 *
 * Prompt structure for generating a replacement character (keep every
 * bracketed part, change only the subject and prop):
 *
 *   "Flat vector character illustration of [a friendly Bengaluru elephant]
 *    [holding a crockpot], trading-card style: uniform thick black outline,
 *    flat colour fills with no shading, simple geometric shapes, dot eyes,
 *    [pastel pink] to [butter yellow] gradient background, centred, square
 *    crop, no text, no drop shadow."
 */
export function BingoCardIllustrator({
  id,
  src,
  className,
  strokeWidth = 2,
}: {
  id: string;
  /** Optional generated image that replaces the built-in drawing. */
  src?: string;
  className?: string;
  strokeWidth?: number;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} loading="lazy" decoding="async" />;
  }
  if (!(id in TILE_ART)) return <span className={className} aria-hidden="true" />;
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: tileSvg(id, strokeWidth) }}
    />
  );
}
