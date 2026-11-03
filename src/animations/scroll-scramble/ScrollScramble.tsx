import { motion, stagger, useTransform, type MotionValue } from "motion/react";

type ScrollScrambleProps = {
  text: string;
  /** A scroll value; characters type in, left to right, as it goes from `from` to `to`. */
  progress: MotionValue<number>;
  from: number;
  to: number;
  /** Glyphs a character cycles through before it locks. */
  glyphs: string;
  className?: string;
  enabled: boolean;
};

/** Share of the range each character spends scrambling; the rest is the stagger between them. */
const WINDOW = 0.15;
/** Glyph changes per character window. Steps follow the scroll, so scrolling back rewinds the same glyphs. */
const SWAPS = 6;

/**
 * Text types itself in as the page scrolls through a range: each character appears as a scrambling glyph,
 * then locks to its letter, staggered from the first (motion.dev `stagger`). Screen readers get the plain text.
 */
export function ScrollScramble({ text, progress, from, to, glyphs, className, enabled }: ScrollScrambleProps) {
  const chars = [...text];
  const span = to - from, window = span * WINDOW;
  const offset = stagger((span - window) / Math.max(1, chars.length - 1));
  const shown = useTransform(progress, (p) => chars.map((char, i) => {
    const local = (p - from - offset(i, chars.length)) / window;
    if (local <= 0) return "";
    if (local >= 1 || char === " ") return char;
    return glyphs[(i * 7 + Math.floor(local * SWAPS) * 13) % glyphs.length];
  }).join(""));
  if (!enabled) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      <span className="visually-hidden">{text}</span>
      <motion.span aria-hidden="true">{shown}</motion.span>
    </span>
  );
}
