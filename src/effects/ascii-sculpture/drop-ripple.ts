import { clamp } from "../../lib/math/math";
import { ringAt, type Ring } from "./waves";

/** Rings after the drop: one splash, then the transition (owner, 2026-10-31). Any later ring starts this far into the scrub. */
const DROP_RIPPLES = 1;
const SECOND_START = 0.35;
/**
 * The page-load ripple's shape (huge: out to 1.6 × half the field, a band 0.85 × half wide), but subtle:
 * at this strength fewer letters scramble and they glow less.
 */
const DROP_STRENGTH = 0.25;

/**
 * The rings a dropped logo leaves in the field at scrub progress `s` (0..1, driven by scroll, so scrolling
 * back rewinds them), from `centre` in cells, sized by `half` (half the columns). No reveal: the field stays.
 */
export function dropRipples(s: number, centre: { x: number; y: number }, half: number): Ring[] {
  const rings: Ring[] = [];
  const span = 1 - SECOND_START * (DROP_RIPPLES - 1);
  for (let k = 0; k < DROP_RIPPLES; k++) {
    const t = clamp((s - k * SECOND_START) / span, 0, 1);
    if (t > 0 && t < 1) rings.push(ringAt(t, { x: centre.x, y: centre.y, reveal: false, strength: DROP_STRENGTH }, half));
  }
  return rings;
}
