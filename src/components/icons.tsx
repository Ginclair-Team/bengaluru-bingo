import { spriteRects, type Sprite } from "@/lib/pixel";
import { STAR_SPRITE } from "./Cards/glyphs";

// 8x8 one-colour pixel icons (DESIGN.md section 8). Drawn in currentColor and
// sized by CSS (1em by default); `#` is a lit pixel.

const px = (rows: string[]): Sprite => rows.map((r) => r.replace(/#/g, "K"));

export const ICON_SPRITES = {
  flip: px([
    "........",
    ".....#..",
    ".######.",
    ".....#..",
    "..#.....",
    ".######.",
    "..#.....",
    "........",
  ]),
  save: px([
    "...##...",
    "...##...",
    ".######.",
    "..####..",
    "...##...",
    "........",
    "#......#",
    "########",
  ]),
  chat: px([
    "########",
    "#......#",
    "#......#",
    "#......#",
    "########",
    "..##....",
    "..#.....",
    "........",
  ]),
  post: px([
    "##....##",
    ".##..##.",
    "..####..",
    "...##...",
    "...##...",
    "..####..",
    ".##..##.",
    "##....##",
  ]),
  link: px([
    "#####...",
    "#...#...",
    "#...#...",
    "#..#####",
    "#####..#",
    "...#...#",
    "...#...#",
    "...#####",
  ]),
  club: px([
    "###.....",
    "#.#.....",
    "#.#..###",
    "#.######",
    "#.#..#.#",
    "###..#.#",
    ".....###",
    "........",
  ]),
  soundOn: px([
    "........",
    "....#...",
    "...##..#",
    "####.#.#",
    "####.#.#",
    "...##..#",
    "....#...",
    "........",
  ]),
  soundOff: px([
    "........",
    "....#...",
    "...###.#",
    "####..#.",
    "####.#.#",
    "...##...",
    "....#...",
    "........",
  ]),
  star: STAR_SPRITE,
  arrow: px([
    "........",
    "........",
    "...##...",
    "..####..",
    ".######.",
    "########",
    "........",
    "........",
  ]),
} satisfies Record<string, Sprite>;

type IconProps = { className?: string };

function PixelIcon({
  grid,
  className,
  rotate,
}: {
  grid: Sprite;
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 8 8"
      width="1em"
      height="1em"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      dangerouslySetInnerHTML={{ __html: spriteRects(grid, { mono: true }) }}
    />
  );
}

export const FlipIcon = ({ className }: IconProps) => <PixelIcon grid={ICON_SPRITES.flip} className={className} />;
export const SaveIcon = ({ className }: IconProps) => <PixelIcon grid={ICON_SPRITES.save} className={className} />;
export const ChatIcon = ({ className }: IconProps) => <PixelIcon grid={ICON_SPRITES.chat} className={className} />;
export const PostIcon = ({ className }: IconProps) => <PixelIcon grid={ICON_SPRITES.post} className={className} />;
export const LinkIcon = ({ className }: IconProps) => <PixelIcon grid={ICON_SPRITES.link} className={className} />;
export const ClubIcon = ({ className }: IconProps) => <PixelIcon grid={ICON_SPRITES.club} className={className} />;
export const SoundOnIcon = ({ className }: IconProps) => (
  <PixelIcon grid={ICON_SPRITES.soundOn} className={className} />
);
export const SoundOffIcon = ({ className }: IconProps) => (
  <PixelIcon grid={ICON_SPRITES.soundOff} className={className} />
);
export const StarIcon = ({ className }: IconProps) => <PixelIcon grid={ICON_SPRITES.star} className={className} />;

const ROTATION = { up: 0, right: 90, down: 180, left: 270 } as const;

/** D-pad triangle; rotated by transform in 90 degree steps only. */
export const ArrowIcon = ({ dir, className }: { dir: "up" | "down" | "left" | "right"; className?: string }) => (
  <PixelIcon grid={ICON_SPRITES.arrow} className={className} rotate={ROTATION[dir]} />
);
