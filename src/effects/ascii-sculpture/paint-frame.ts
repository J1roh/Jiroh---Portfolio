import { clamp } from "../../lib/math/math";
import type { Grid } from "./build-grid";
import type { GlyphAtlas } from "./glyph-atlas";
import type { Overlay } from "./project-logo";
import { cellX, copyBase, WHITE, type Layout } from "./paint-base";
import { GLYPHS, paintTwinkles, twinkleChar } from "./twinkle";
import { PULSE_LIFT, pulseReach, pulseTouch, type Pulse, type PulseTouch } from "./logo-pulse";
import { capPush, crestOf, PUSH_MAX_PX, ringOf, WAKE_PUSH_PX, wakeOf, type Ring, type Ripple, type Wake } from "./waves";

/** `overlay` is the tilted logo, or null while it rests flat (then the cached base already has it); `pulse` the logo-shaped echo. */
type FrameState = { time: number; ripples: Ripple[]; wakes: Wake[]; overlay: Overlay | null; pulse: Pulse | null; drops?: Ring[] };

const SCRAMBLE_HZ = 24;
/** Fields per pending cell: row, column, tone, alpha, x and y push. */
const STRIDE = 6;

/**
 * One animated frame (after The Content Architecture's shader, in Canvas 2D). Copies the cached base,
 * then visits only the cells the tilted logo, a wake or a ripple can reach. It clears all changed
 * cells before drawing any, so a glyph pushed into the next row is never cut by that row's clear.
 */
export function paintFrame(context: CanvasRenderingContext2D, base: HTMLCanvasElement, grid: Grid, atlas: GlyphAtlas, layout: Layout, state: FrameState) {
  const { cols, rows } = grid;
  const aspect = layout.w / layout.h;
  const { time, overlay } = state;
  const rings = [...state.ripples.map((ripple) => ringOf(ripple, time, cols / 2)), ...(state.drops ?? [])];
  // Each wake only touches its crest band; squared bounds let cells skip it without a square root.
  const wakes = state.wakes.map((wake) => wakeOf(wake, time)).filter((wake) => wake.life > 0.01).map((wake) => ({
    ...wake, outer2: (wake.radius + wake.width / 2) ** 2, inner2: Math.max(0, wake.radius - wake.width / 2) ** 2,
  }));

  context.globalAlpha = 1;
  copyBase(context, base, layout);
  if (!overlay) paintTwinkles(context, grid, atlas, layout, time);

  // Bounding box (in cells) of everything that can change a cell this frame.
  let top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
  const reach = (x: number, y: number, radius: number) => {
    top = Math.min(top, y - radius * aspect); bottom = Math.max(bottom, y + radius * aspect);
    left = Math.min(left, x - radius); right = Math.max(right, x + radius);
  };
  const pushCells = PUSH_MAX_PX / layout.w;
  for (const wake of wakes) reach(wake.x, wake.y, wake.radius + wake.width / 2 + pushCells);
  // A reveal ring hides everything beyond it, so it can touch the whole field.
  for (const ring of rings) reach(ring.x, ring.y, ring.reveal ? cols + rows : ring.radius + ring.width / 2);
  if (overlay) {
    top = Math.min(top, overlay.r0); bottom = Math.max(bottom, overlay.r0 + overlay.rows - 1);
    left = Math.min(left, overlay.c0); right = Math.max(right, overlay.c0 + overlay.cols - 1);
  }
  const p = state.pulse && pulseReach(state.pulse);
  if (p) { top = Math.min(top, p.r0); bottom = Math.max(bottom, p.r1); left = Math.min(left, p.c0); right = Math.max(right, p.c1); }
  if (top > bottom) return;

  const r0 = clamp(Math.floor(top), 0, rows - 1), r1 = clamp(Math.ceil(bottom), 0, rows - 1);
  const c0 = clamp(Math.floor(left), 0, cols - 1), c1 = clamp(Math.ceil(right), 0, cols - 1);
  const pending: number[] = [];
  const glyphs: string[] = [], touch: PulseTouch = { dx: 0, dy: 0, glow: 0 };

  for (let r = r0; r <= r1; r++) {
    const near = wakes.filter((wake) => ((r - wake.y) / aspect) ** 2 <= wake.outer2);
    for (let c = c0; c <= c1; c++) {
      const i = r * cols + c;
      const noise = grid.hash[i];
      let tone = grid.level[i] - 1, alpha = grid.rest[i], char = grid.chars[i];
      let changed = false;
      const o = overlay ? overlayIndex(overlay, c, r) : -1;
      if (overlay && o >= 0) {
        changed = true;
        if (overlay.tier[o]) { tone = overlay.tier[o] - 1; alpha = overlay.alpha[o]; char = overlay.chars[o]; }
        else { tone = grid.field.level[i] - 1; alpha = grid.field.rest[i]; char = grid.field.chars[i]; }
      }
      if (tone === WHITE) char = twinkleChar(noise, time) ?? char;

      // Wakes: glyphs on a crest are pushed outward and lit up, like light on moving water.
      // The logo is a solid in the water: no wake moves or lights its glyphs, only the field around it.
      let dx = 0, dy = 0, lift = 0;
      const solid = o >= 0 ? overlay!.tier[o] > 0 : grid.level[i] >= 2;
      if (!solid) for (const wake of near) {
        const wx = c - wake.x;
        const wy = (r - wake.y) / aspect;
        const d2 = wx * wx + wy * wy;
        if (d2 > wake.outer2 || d2 < wake.inner2) continue;
        const d = Math.sqrt(d2);
        const crest = crestOf(wake, d);
        if (crest <= 0.02 || d < 0.01) continue;
        dx += (wx / d) * crest * WAKE_PUSH_PX;
        dy += (wy / d) * crest * WAKE_PUSH_PX;
        lift = Math.max(lift, crest);
        changed = true;
      }
      if (lift > 0) {
        if (tone >= 0 && tone < WHITE && lift > 0.2) tone += 1;
        alpha = Math.min(1, alpha + lift * 0.85);
      }
      // The logo-shaped water ripple: field letters bob along it, and crests catch a faint steel light.
      if (state.pulse && tone === 0 && pulseTouch(state.pulse, i, touch)) {
        dx += touch.dx; dy += touch.dy; changed = true;
        if (touch.glow > 0.15) { tone = 1; alpha = Math.min(alpha, 0.2 + touch.glow * PULSE_LIFT); }
      }
      for (const ring of rings) {
        const rx = c - ring.x;
        const ry = (r - ring.y) / aspect;
        const d = Math.sqrt(rx * rx + ry * ry);
        if (ring.reveal && d > ring.radius - ring.fade) {
          alpha *= clamp((ring.radius - d) / ring.fade, 0, 1);
          changed = true;
        }
        const band = Math.max(0, 1 - Math.abs(d - ring.radius) / (ring.width / 2)) * ring.life;
        if (noise < band * 0.5) {
          tone = WHITE;
          alpha = Math.max(alpha, band);
          char = GLYPHS[Math.floor(noise * 7919 + time * SCRAMBLE_HZ) % GLYPHS.length];
          changed = true;
        }
      }
      if (!changed) continue;
      const [px, py] = capPush(dx, dy);
      pending.push(r, c, tone, alpha, px, py);
      glyphs.push(char);
    }
  }
  clearRuns(context, layout, pending);
  drawCells(context, atlas, layout, pending, glyphs);
  context.globalAlpha = 1;
}

function overlayIndex(overlay: Overlay, c: number, r: number) {
  const oc = c - overlay.c0, or = r - overlay.r0;
  return oc >= 0 && or >= 0 && oc < overlay.cols && or < overlay.rows ? or * overlay.cols + oc : -1;
}

/** Clears each run of neighbouring changed cells in a row with one call. */
function clearRuns(context: CanvasRenderingContext2D, layout: Layout, pending: number[]) {
  for (let k = 0; k < pending.length;) {
    let end = k;
    while (end + STRIDE < pending.length && pending[end + STRIDE] === pending[k] && pending[end + STRIDE + 1] === pending[end + 1] + 1) end += STRIDE;
    const x0 = cellX(pending[k + 1], layout);
    context.clearRect(x0, pending[k] * layout.h, cellX(pending[end + 1] + 1, layout) - x0, layout.h);
    k = end + STRIDE;
  }
}

function drawCells(context: CanvasRenderingContext2D, atlas: GlyphAtlas, layout: Layout, pending: number[], glyphs: string[]) {
  for (let k = 0, g = 0; k < pending.length; k += STRIDE, g++) {
    const tone = pending[k + 2], alpha = pending[k + 3];
    if (tone < 0 || alpha <= 0.02) continue;
    context.globalAlpha = alpha;
    atlas.draw(context, glyphs[g], tone, cellX(pending[k + 1], layout) + Math.round(pending[k + 4]), pending[k] * layout.h + Math.round(pending[k + 5]));
  }
}
