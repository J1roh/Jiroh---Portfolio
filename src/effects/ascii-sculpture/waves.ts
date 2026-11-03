import { clamp, lerp, smoothstep } from "../../lib/math/math";

/** A broad ring of scrambled glyphs (entrance, retype, drop); `strength` 0..1 scales how many cells it touches and how bright (default 1). */
export type Ripple = { start: number; x: number; y: number; reveal: boolean; strength?: number };
/**
 * A water ring dropped behind the pointer or the tilting logo's edge, in cell units; `strength` 0..1 (default 1).
 * Wakes ripple the field only; the logo's own glyphs stay put.
 */
export type Wake = {
  start: number; x: number; y: number; strength?: number;
  /** Ring starts this many cells out and travels `span` further (defaults 0 and WAKE_RADIUS). */
  from?: number; span?: number;
};

export const RIPPLE_S = 1.8;
export const WAKE_S = 2.2;
/** How far a wake ring travels, in cells; its crest widens from 4 to 10 cells as it goes. */
export const WAKE_RADIUS = 30;
const WAKE_WIDTH_START = 4;
const WAKE_WIDTH_END = 10;
/** How far one wake pushes glyphs outward at its crest, in px. */
export const WAKE_PUSH_PX = 11;
/** Overlapping wakes add up, but the total push eases into this cap, so glyphs stay near their cell. */
export const PUSH_MAX_PX = 9;

/** A wake at `time`: a slow swell that widens and fades as it spreads. */
export function wakeOf(wake: Wake, time: number) {
  const t = clamp((time - wake.start) / WAKE_S, 0, 1);
  const from = wake.from ?? 0;
  const travelled = (1 - (1 - t) * (1 - t)) * (wake.span ?? WAKE_RADIUS);
  return {
    x: wake.x,
    y: wake.y,
    radius: from + travelled,
    width: lerp(WAKE_WIDTH_START, WAKE_WIDTH_END, t),
    life: (((1 - t) * (1 - t)) / Math.sqrt(1 + travelled / 10)) * (wake.strength ?? 1),
  };
}

export type WakeRing = ReturnType<typeof wakeOf>;

/** How strongly a cell `d` cells from a wake's centre sits on its crest, 0..1. */
export const crestOf = (wake: WakeRing, d: number) =>
  Math.max(0, 1 - Math.abs(d - wake.radius) / (wake.width / 2)) * wake.life;

/** Soft cap for the summed push, keeping its direction. */
export function capPush(dx: number, dy: number): [number, number] {
  const length = Math.hypot(dx, dy);
  if (length < 0.01) return [0, 0];
  const scale = (PUSH_MAX_PX * Math.tanh(length / PUSH_MAX_PX)) / length;
  return [dx * scale, dy * scale];
}

/** A click or entrance ripple at `time`, sized to the field (`half` = half the columns). */
export const ringOf = (ripple: Ripple, time: number, half: number) => ringAt(clamp((time - ripple.start) / RIPPLE_S, 0, 1), ripple, half);

export type Ring = ReturnType<typeof ringAt>;

/** A ripple's ring at progress `t` (0..1), for rings driven by something other than the clock, e.g. scroll. */
export function ringAt(t: number, ripple: Omit<Ripple, "start">, half: number) {
  return {
    x: ripple.x,
    y: ripple.y,
    reveal: ripple.reveal,
    radius: smoothstep(0, 1, t) * 1.6 * half,
    width: 0.85 * half,
    fade: 0.15 * half,
    life: smoothstep(0, 0.22, t) * (1 - smoothstep(0.78, 1, t)) * (ripple.strength ?? 1),
  };
}
