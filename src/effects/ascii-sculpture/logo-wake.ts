import { clamp } from "../../lib/math/math";
import type { LogoMotion } from "./logo-motion";
import type { Volume } from "./logo-volume";
import type { Wake } from "./waves";

/** Outline points, one per direction around the logo centre (the farthest solid texel that way). */
const POINTS = 24;
/** How far an outline point must dip into the screen, px, before it drops a wake; or this long while it keeps dipping. */
const STEP_PX = 45;
const GAP_S = 0.18;
/** Points dipping slower than this (px/s) leave the water calm, so small settling motions stay quiet. */
const MIN_SPEED = 60;
/** Only points dipping at least this share of the fastest one ripple, so the tilted edge leads, not the whole rim. */
const LEAD_SHARE = 0.6;
/** At this dip speed (px/s) a wake is full strength; slower ones are fainter, down to MIN_STRENGTH. */
const FULL_SPEED = 150;
const MIN_STRENGTH = 0.85;
/** Wakes start this far outside the outline, in cells, so they spread into the field, not under the logo. */
const OUTSIDE_CELLS = 1.5;
/** A full tilt drops about this many; the shared wake list may hold this many while the logo stirs it. */
const MAX_WAKES = 28;

type Cell = { w: number; h: number };

/**
 * The tilting logo stirs the water around it. The screen is the water surface: as the logo tilts
 * toward the pointer, the edge on that side dips into the screen, and wakes start from that edge,
 * as strong as it dips fast. Rising edges stay calm. Uses the renderer's matrix on real outline points.
 */
export function createLogoWake() {
  let outline = new Float64Array(0);
  let source: Volume | null = null;
  const depth = new Float64Array(POINTS);
  const speeds = new Float64Array(POINTS);
  const travel = new Float64Array(POINTS);
  const since = new Float64Array(POINTS);
  let fresh = false;

  return {
    /** One frame; while the logo turns it may push wakes (cells, `now` s). */
    step: (motion: LogoMotion, volume: Volume, cell: Cell, dt: number, now: number, wakes: Wake[]) => {
      // At rest: calm water, and the next tilt starts from scratch.
      if (motion.settled() || dt <= 0) { fresh = false; travel.fill(0); since.fill(0); return; }
      if (source !== volume) { outline = traceOutline(volume); source = volume; fresh = false; }
      const m = motion.read();
      let fastest = 0;
      for (let k = 0; k < POINTS; k++) {
        // Depth into the screen of this outline point (logo z = 0, mid-depth).
        const z = m[6] * outline[2 * k] + m[7] * outline[2 * k + 1];
        speeds[k] = fresh ? (z - depth[k]) / dt : 0;
        depth[k] = z;
        fastest = Math.max(fastest, speeds[k]);
      }
      fresh = true;
      for (let k = 0; k < POINTS; k++) {
        const speed = speeds[k];
        if (speed < MIN_SPEED || speed < fastest * LEAD_SHARE) { travel[k] = 0; since[k] = 0; continue; }
        travel[k] += speed * dt;
        since[k] += dt;
        if (travel[k] < STEP_PX && since[k] < GAP_S) continue;
        travel[k] = 0;
        since[k] = 0;
        // On screen, just outside the outline, along the line from the logo centre through the point.
        const x = outline[2 * k], y = outline[2 * k + 1];
        const sx = m[0] * x + m[1] * y, sy = m[3] * x + m[4] * y;
        const out = 1 + (OUTSIDE_CELLS * cell.w) / Math.max(1, Math.hypot(sx, sy));
        wakes.push({ start: now, x: (volume.cx + sx * out) / cell.w, y: (volume.cy + sy * out) / cell.h, strength: clamp(speed / FULL_SPEED, MIN_STRENGTH, 1) });
        if (wakes.length > MAX_WAKES) wakes.shift();
      }
    },
  };
}

/** The farthest solid texel from the centre in each of POINTS directions, px around the logo centre. */
function traceOutline(v: Volume) {
  const points = new Float64Array(POINTS * 2);
  const reach = Math.hypot(v.w, v.h) / 2;
  for (let k = 0; k < POINTS; k++) {
    const angle = (k / POINTS) * Math.PI * 2;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    for (let r = reach; r > 0; r -= v.texel / 2) {
      const tx = Math.floor((r * dx + v.w / 2) / v.texel), ty = Math.floor((r * dy + v.h / 2) / v.texel);
      if (tx < 0 || ty < 0 || tx >= v.mw || ty >= v.mh || !v.solid[ty * v.mw + tx]) continue;
      points[2 * k] = r * dx;
      points[2 * k + 1] = r * dy;
      break;
    }
  }
  return points;
}
