"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BingoCardIllustrator } from "@/components/BingoCardIllustrator";
import { TILES, isMarked, type Marks } from "@/lib/game";

// Weighty springs: tiles settle into the board once on load, and a stamp
// lands with a thud rather than a fade.
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.028, delayChildren: 0.08 } },
};

const tileVariants = {
  hidden: { y: -14, scale: 0.88 },
  show: { y: 0, scale: 1, transition: { type: "spring", stiffness: 210, damping: 17, mass: 1.35 } },
};

/** Each stamp sits at its own slightly careless angle, the same every visit. */
function stampAngle(index: number): number {
  return ((index * 47) % 37) - 18;
}

function Stamp({ index }: { index: number }) {
  const angle = stampAngle(index);
  return (
    <motion.span
      className="tile-stamp"
      initial={{ scale: 1.9, opacity: 0, rotate: angle - 14 }}
      animate={{ scale: 1, opacity: 0.92, rotate: angle }}
      exit={{ scale: 0.92, opacity: 0, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 520, damping: 21, mass: 1.1 }}
    >
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
        <circle cx="24" cy="24" r="21" strokeWidth="2.6" strokeDasharray="58 3 40 2 26 4" />
        <circle cx="17" cy="19" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="31" cy="19" r="2.4" fill="currentColor" stroke="none" />
        <path d="M13 28 Q24 40 35 28" strokeWidth="2.6" />
      </svg>
    </motion.span>
  );
}

export function Board({
  marks,
  focused,
  onToggle,
}: {
  marks: Marks;
  focused: number | null;
  onToggle: (index: number) => void;
}) {
  return (
    <div className="board">
      <div className="board-letters" aria-hidden="true">
        {"BINGO".split("").map((letter) => (
          <span key={letter}>{letter}</span>
        ))}
      </div>

      <motion.div
        className="board-grid"
        role="group"
        aria-label="Bingo card, 25 tiles"
        variants={gridVariants}
        initial="hidden"
        animate="show"
      >
        {TILES.map((tile, index) => {
          const marked = isMarked(marks, index);
          return (
            <motion.button
              key={tile.id}
              type="button"
              className="tile"
              variants={tileVariants}
              whileHover={{ scale: 1.05, zIndex: 2 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={marked}
              aria-label={`${tile.name}. ${tile.blurb}`}
              data-focused={focused === index}
              onClick={() => onToggle(index)}
            >
              <span>{tile.top}</span>
              <BingoCardIllustrator id={tile.id} className="tile-art" strokeWidth={2.4} />
              <span>{tile.bottom}</span>
              <AnimatePresence initial={false}>{marked && <Stamp index={index} />}</AnimatePresence>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="board-foot" aria-hidden="true">
        <span>Bengaluru</span>
        <strong>Namma Ooru</strong>
        <span className="text-right">Ginhouse</span>
      </div>
    </div>
  );
}
