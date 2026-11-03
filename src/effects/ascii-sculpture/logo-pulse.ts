import { smoothstep } from "../../lib/math/math";
import type { Grid } from "./build-grid";

/** The logo-shaped water ripple: off for now (owner, 2026-10-31). */
export const LOGO_PULSE = false;
/** A ripple leaves the logo every this many seconds and travels for PULSE_TRAVEL_S; the rest is calm. */
const PULSE_EVERY_S = 4;
const PULSE_TRAVEL_S = 2.8;
/** How far the ripple travels from the outline, in column widths. */
const PULSE_REACH = 30;
/** Water ripple: crests this far apart (column widths), in a packet that fades over about SPREAD either side of its centre. */
const WAVELENGTH = 4.5;
const SPREAD = 4;
/** Crests push letters outward and troughs pull them in, by up to this many px; crests also catch light. */
const PUSH_PX = 3.5;
export const PULSE_LIFT = 0.45;
/**
 * The ripple starts as the logo's exact outline and loses its shape as it spreads, as a wave in water does:
 * by SOFTEN_BY (share of the reach) it follows a blurred outline (corners and gaps filled in), and toward
 * the end it leans ROUND_SHARE of the way to a plain rounded ring around the logo.
 */
const SOFTEN_BY = 0.95;
const ROUND_SHARE = 0.55;
/** The blurred outline: box blur radius in columns (rows count as their true height) and passes (3 ≈ gaussian). */
const BLUR_COLS = 5;
const BLUR_PASSES = 3;

/** A distance map in column widths (rows count as their true height), with its unit direction away from the logo. */
type DistanceMap = { d: Float32Array; gx: Float32Array; gy: Float32Array };
/** The sharp outline, the softened outline and the rounded ring, plus where the logo is. */
export type PulseField = { sharp: DistanceMap; soft: DistanceMap; round: DistanceMap; bounds: { c0: number; r0: number; c1: number; r1: number }; aspect: number };
export type Pulse = { radius: number; life: number; soft: number; round: number; field: PulseField };
/** What the ripple does to one cell: push in px and crest light, 0..1. */
export type PulseTouch = { dx: number; dy: number; glow: number };

export function buildPulseField(grid: Grid, cell: { w: number; h: number }): PulseField {
  const { cols, rows, level } = grid;
  const dy = cell.h / cell.w, cap = PULSE_REACH + 3 * SPREAD;
  const bounds = { c0: cols, r0: rows, c1: -1, r1: -1 };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (level[r * cols + c] < 2) continue;
      bounds.c0 = Math.min(bounds.c0, c); bounds.c1 = Math.max(bounds.c1, c); bounds.r0 = Math.min(bounds.r0, r); bounds.r1 = Math.max(bounds.r1, r);
    }
  }
  const sharp = chamfer(grid, dy, cap);
  const soft = blur(sharp, cols, rows, Math.max(1, Math.round(BLUR_COLS / dy)));
  // A ring around the logo centre, sized so its zero sits on the outline on average.
  const cx = (bounds.c0 + bounds.c1) / 2, cy = (bounds.r0 + bounds.r1) / 2;
  const round = new Float32Array(cols * rows);
  let edge = 0, count = 0;
  for (let i = 0; i < round.length; i++) {
    const c = i % cols, r = (i - c) / cols;
    round[i] = Math.hypot(c - cx, (r - cy) * dy);
    if (sharp[i] > 0.5 && sharp[i] < 1.6) { edge += round[i]; count++; }
  }
  const zero = count ? edge / count : 0;
  for (let i = 0; i < round.length; i++) round[i] = Math.max(0, round[i] - zero);
  return { sharp: slope(sharp, cols, rows, dy), soft: slope(soft, cols, rows, dy), round: slope(round, cols, rows, dy), bounds, aspect: cell.w / cell.h };
}

/** The ripple at `time` s, or null while the field rests between beats. */
export function pulseAt(time: number, field: PulseField): Pulse | null {
  const t = (time % PULSE_EVERY_S) / PULSE_TRAVEL_S;
  if (t >= 1) return null;
  const spread = 1 - (1 - t) * (1 - t);
  return {
    radius: spread * PULSE_REACH, life: smoothstep(0, 0.12, t) * (1 - t) ** 1.5,
    soft: smoothstep(0, SOFTEN_BY, spread), round: ROUND_SHARE * smoothstep(0.3, 1, spread), field,
  };
}

/**
 * The ripple at field cell `i`, written into `out`: a packet of crests and troughs around the ripple's
 * radius on the blended (sharp → soft → round) distance, pushing away from the logo. False when calm.
 */
export function pulseTouch(pulse: Pulse, i: number, out: PulseTouch) {
  const { sharp, soft, round } = pulse.field;
  const a = pulse.soft, b = pulse.round;
  const blend = (s: number, f: number, o: number) => ((1 - a) * s + a * f) * (1 - b) + o * b;
  const offset = blend(sharp.d[i], soft.d[i], round.d[i]) - pulse.radius;
  if (Math.abs(offset) > 2.5 * SPREAD) return false;
  const wave = Math.cos((2 * Math.PI * offset) / WAVELENGTH) * Math.exp(-((offset / SPREAD) ** 2)) * pulse.life;
  if (Math.abs(wave) < 0.03) return false;
  const gx = blend(sharp.gx[i], soft.gx[i], round.gx[i]), gy = blend(sharp.gy[i], soft.gy[i], round.gy[i]);
  const length = Math.hypot(gx, gy) || 1;
  out.dx = (gx / length) * wave * PUSH_PX;
  out.dy = (gy / length) * wave * PUSH_PX;
  out.glow = Math.max(0, wave);
  return true;
}

/** The cells a ripple can reach: the logo's bounds grown by the packet's outer edge (rows are taller). */
export function pulseReach(pulse: Pulse) {
  const out = pulse.radius + 2.5 * SPREAD + BLUR_COLS + 1, { c0, r0, c1, r1 } = pulse.field.bounds;
  return { c0: c0 - out, c1: c1 + out, r0: r0 - out * pulse.field.aspect, r1: r1 + out * pulse.field.aspect };
}

/** Two-pass chamfer distance from every cell to the nearest logo cell (grid level ≥ 2), capped. */
function chamfer(grid: Grid, dy: number, cap: number) {
  const { cols, rows, level } = grid;
  const dd = Math.hypot(1, dy), d = new Float32Array(cols * rows);
  for (let i = 0; i < d.length; i++) d[i] = level[i] >= 2 ? 0 : cap;
  const at = (c: number, r: number) => (c < 0 || r < 0 || c >= cols || r >= rows ? cap : d[r * cols + c]);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    d[i] = Math.min(d[i], at(c - 1, r) + 1, at(c, r - 1) + dy, at(c - 1, r - 1) + dd, at(c + 1, r - 1) + dd);
  }
  for (let r = rows - 1; r >= 0; r--) for (let c = cols - 1; c >= 0; c--) {
    const i = r * cols + c;
    d[i] = Math.min(d[i], at(c + 1, r) + 1, at(c, r + 1) + dy, at(c + 1, r + 1) + dd, at(c - 1, r + 1) + dd);
  }
  return d;
}

/** Separable box blur, BLUR_PASSES times: `rowsRadius` rows tall and BLUR_COLS columns wide. */
function blur(source: Float32Array, cols: number, rows: number, rowsRadius: number) {
  let a = Float32Array.from(source), b = new Float32Array(source.length);
  for (let pass = 0; pass < BLUR_PASSES; pass++) {
    for (const [step, count, span, radius] of [[1, cols, rows, BLUR_COLS], [cols, rows, cols, rowsRadius]] as const) {
      for (let line = 0; line < span; line++) {
        const start = step === 1 ? line * cols : line;
        for (let k = 0; k < count; k++) {
          let sum = 0, n = 0;
          for (let j = Math.max(0, k - radius); j <= Math.min(count - 1, k + radius); j++) { sum += a[start + j * step]; n++; }
          b[start + k * step] = sum / n;
        }
      }
      [a, b] = [b, a];
    }
  }
  return a;
}

/** A distance map with its unit slope, the direction away from the logo on screen. */
function slope(d: Float32Array, cols: number, rows: number, dy: number): DistanceMap {
  const gx = new Float32Array(d.length), gy = new Float32Array(d.length);
  const at = (c: number, r: number) => d[Math.min(rows - 1, Math.max(0, r)) * cols + Math.min(cols - 1, Math.max(0, c))];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = (at(c + 1, r) - at(c - 1, r)) / 2, y = (at(c, r + 1) - at(c, r - 1)) / (2 * dy);
    const length = Math.hypot(x, y);
    if (length > 1e-3) { gx[r * cols + c] = x / length; gy[r * cols + c] = y / length; }
  }
  return { d, gx, gy };
}
