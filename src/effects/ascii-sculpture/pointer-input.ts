import type { Layout } from "./paint-base";
import type { LogoMotion } from "./logo-motion";
import { WAKE_RADIUS, type Wake } from "./waves";

const MAX_WAKES = 16;
/** Drop a wake after the pointer travels this many cells, or this long while still moving. */
const WAKE_STEP_CELLS = 4;
const WAKE_GAP_S = 0.16;
/** No wake at all under this much travel, so a resting or jittery hand stays calm. */
const WAKE_MIN_CELLS = 1.5;
/**
 * Stirring over the logo sends one ring from the logo's centre instead, so the water moves out on every
 * side at once, at most this often. It starts just inside the logo's shorter half-size.
 */
const LOGO_RING_GAP_S = 0.45;
const LOGO_RING_START = 0.8;
/** Hover spins the logo within its bounds plus this share of its size on each side. */
const HOVER_MARGIN = 0.12;
/** Pointer samples further apart than this are a new gesture, not a fling. */
const HOVER_GAP_S = 0.1;

type Bounds = { c0: number; r0: number; c1: number; r1: number };
type InputOptions = {
  layout: Layout;
  motion: LogoMotion;
  wakes: Wake[];
  /** The logo's cell bounds, once built. */
  bounds: () => Bounds | null;
  now: () => number;
  wake: () => void;
};

/** Turns pointer positions (px in the canvas) into logo motion on hover and water wakes as it moves. */
export function createPointerInput({ layout, motion, wakes, bounds, now, wake }: InputOptions) {
  const lastHover = { x: 0, y: 0, time: -1 };
  const lastWake = { x: -1e3, y: -1e3, time: -1 };
  let lastLogoRing = -Infinity;
  // Rows are taller than columns; measure travel in column widths on both axes.
  const rowScale = layout.h / layout.w;

  const overLogo = (x: number, y: number) => {
    const box = bounds();
    if (!box) return false;
    const mx = (box.c1 - box.c0) * HOVER_MARGIN, my = (box.r1 - box.r0) * HOVER_MARGIN;
    return x >= box.c0 - mx && x <= box.c1 + mx && y >= box.r0 - my && y <= box.r1 + my;
  };

  return {
    hover: (at: { x: number; y: number }) => {
      const x = at.x / layout.w, y = at.y / layout.h, time = now();
      const fresh = lastHover.time >= 0 && time - lastHover.time < HOVER_GAP_S;
      if (fresh && overLogo(x, y)) {
        motion.push(x - lastHover.x, (y - lastHover.y) * rowScale, time - lastHover.time);
        wake();
      }
      Object.assign(lastHover, { x, y, time });
    },
    drag: (at: { x: number; y: number }) => {
      const x = at.x / layout.w, y = at.y / layout.h, time = now();
      const travelled = Math.hypot(x - lastWake.x, (y - lastWake.y) * rowScale);
      if (travelled < WAKE_MIN_CELLS) return;
      if (travelled < WAKE_STEP_CELLS && time - lastWake.time < WAKE_GAP_S) return;
      Object.assign(lastWake, { x, y, time });
      const box = bounds();
      if (box && overLogo(x, y)) {
        if (time - lastLogoRing < LOGO_RING_GAP_S) return;
        lastLogoRing = time;
        // Half-sizes in column widths (rows are taller), so the ring clears the logo evenly all round.
        const halfW = (box.c1 - box.c0) / 2, halfH = ((box.r1 - box.r0) / 2) * rowScale;
        const from = LOGO_RING_START * Math.min(halfW, halfH);
        wakes.push({ start: time, x: (box.c0 + box.c1) / 2, y: (box.r0 + box.r1) / 2, from, span: Math.max(halfW, halfH) - from + WAKE_RADIUS });
      } else {
        wakes.push({ start: time, x, y });
      }
      if (wakes.length > MAX_WAKES) wakes.shift();
      wake();
    },
    /** Pointer left or let go: the next sample starts a fresh gesture. */
    release: () => {
      lastHover.time = -1;
      Object.assign(lastWake, { x: -1e3, y: -1e3, time: -1 });
    },
  };
}
