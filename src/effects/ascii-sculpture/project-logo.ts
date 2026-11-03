import { clamp, smoothstep } from "../../lib/math/math";
import type { Grid } from "./build-grid";
import type { Volume } from "./logo-volume";
import { traceSolid, type Hit } from "./trace-solid";
import { shade } from "./mark-material";

/** Walls read a touch greyer than the faces, as in content/3d/flag_render.png. */
const WALL_TONE = 0.85;
/**
 * Shade is carried by opacity, which changes smoothly; tiers only step up for a strong highlight.
 * Hard tier steps drew bands that swept across the surface as it turned.
 */
const HIGHLIGHT = 0.3;
const SHADE_GAIN = 0.6;
const MIN_ALPHA = 0.4;
/** Far parts of the logo dim by this much per logo width of depth, never below FOG_FLOOR. */
const FOG = 0.9;
const FOG_FLOOR = 0.6;
/** Anti-aliasing: cells on the outline are sampled this many times across and down (cells are tall). */
const SUB_X = 2;
const SUB_Y = 3;
/** Coverage below EDGE_IN shows nothing and above EDGE_FULL shows fully: a crisp edge that still steps smoothly. */
const EDGE_IN = 0.35;
const EDGE_FULL = 0.5;
const FILL = "JIROH";

type Cell = { w: number; h: number };

/** What the turned logo covers, cell by cell, inside a box around it. Tier 0 lets the field show. */
export type Overlay = {
  c0: number; r0: number; cols: number; rows: number;
  tier: Uint8Array; chars: string[]; alpha: Float32Array;
  /** Per cell, from the centre ray: 0 nothing, 1 face, 2 wall. Outline cells are where it changes. */
  kind: Uint8Array;
};

/** The box covers the logo's bounding sphere, so it holds the logo at any orientation. */
export function createOverlay(volume: Volume, grid: Grid, cell: Cell): Overlay {
  const radius = Math.hypot(volume.w / 2, volume.h / 2, volume.depth / 2);
  const c0 = clamp(Math.floor((volume.cx - radius) / cell.w), 0, grid.cols - 1);
  const c1 = clamp(Math.ceil((volume.cx + radius) / cell.w), 0, grid.cols - 1);
  const r0 = clamp(Math.floor((volume.cy - radius) / cell.h), 0, grid.rows - 1);
  const r1 = clamp(Math.ceil((volume.cy + radius) / cell.h), 0, grid.rows - 1);
  const cols = c1 - c0 + 1, rows = r1 - r0 + 1, count = cols * rows;
  return { c0, r0, cols, rows, tier: new Uint8Array(count), chars: new Array(count), alpha: new Float32Array(count), kind: new Uint8Array(count) };
}

/**
 * Draws the logo turned by `m` (row-major, logo axes to screen axes) into the overlay. Rays look
 * straight down +z (orthographic), so at rest each cell sees exactly its own flat logo cell. One ray
 * per cell, then outline cells are supersampled and their opacity scaled by coverage. Letters are
 * the screen cell's own, so turning never resamples the text into seams.
 */
export function projectLogo(volume: Volume, grid: Grid, cell: Cell, m: Float64Array, out: Overlay) {
  const front = -Math.hypot(volume.w, volume.h, volume.depth);
  const dir = [m[6], m[7], m[8]];
  const origin = [0, 0, 0];
  const hit: Hit = { face: false, t: 0, nx: 0, ny: 0, nz: 0, tier: 0 };
  const shaded = { tier: 0, alpha: 0 };

  /** Casts at a screen point (px from the logo centre); fills `shaded` and returns the kind hit. */
  const sample = (sx: number, sy: number) => {
    origin[0] = m[0] * sx + m[3] * sy + m[6] * front;
    origin[1] = m[1] * sx + m[4] * sy + m[7] * front;
    origin[2] = m[2] * sx + m[5] * sy + m[8] * front;
    if (!traceSolid(volume, grid, cell, origin, dir, hit)) return 0;
    const nx = m[0] * hit.nx + m[1] * hit.ny + m[2] * hit.nz;
    const ny = m[3] * hit.nx + m[4] * hit.ny + m[5] * hit.nz;
    const nz = m[6] * hit.nx + m[7] * hit.ny + m[8] * hit.nz;
    const fog = clamp(1 - (FOG * (front + hit.t + volume.depth / 2)) / volume.w, FOG_FLOOR, 1);
    const light = shade(nx, ny, nz);
    if (hit.face) {
      // Relative to this face looking straight at the viewer, so at rest it is the flat logo exactly.
      const change = light - shade(hit.nx, hit.ny, -Math.abs(hit.nz));
      shaded.tier = change > HIGHLIGHT ? 3 : hit.tier;
      shaded.alpha = clamp(1 + change * SHADE_GAIN, MIN_ALPHA, 1) * fog;
      return 1;
    }
    const tone = light * WALL_TONE;
    shaded.tier = tone > 0.95 ? 3 : 2;
    shaded.alpha = clamp(tone, MIN_ALPHA, 1) * fog;
    return 2;
  };

  for (let r = 0; r < out.rows; r++) {
    const sy = (out.r0 + r + 0.5) * cell.h - volume.cy;
    for (let c = 0; c < out.cols; c++) {
      const o = r * out.cols + c;
      out.kind[o] = sample((out.c0 + c + 0.5) * cell.w - volume.cx, sy);
      out.tier[o] = out.kind[o] ? shaded.tier : 0;
      out.alpha[o] = shaded.alpha;
    }
  }

  // Outline cells (any neighbour saw something else): average SUB_X × SUB_Y rays, opacity × coverage.
  const kind = out.kind;
  for (let r = 0; r < out.rows; r++) {
    for (let c = 0; c < out.cols; c++) {
      const o = r * out.cols + c;
      const k = kind[o];
      const edge = (c > 0 && kind[o - 1] !== k) || (c < out.cols - 1 && kind[o + 1] !== k)
        || (r > 0 && kind[o - out.cols] !== k) || (r < out.rows - 1 && kind[o + out.cols] !== k);
      if (edge) supersample(o, c, r);
      if (out.tier[o]) out.chars[o] = glyphAt(grid, out.c0 + c, out.r0 + r, kind[o] === 2);
    }
  }

  function supersample(o: number, c: number, r: number) {
    let hits = 0, alpha = 0, tier = 0;
    for (let j = 0; j < SUB_Y; j++) {
      const sy = (out.r0 + r + (j + 0.5) / SUB_Y) * cell.h - volume.cy;
      for (let i = 0; i < SUB_X; i++) {
        if (!sample((out.c0 + c + (i + 0.5) / SUB_X) * cell.w - volume.cx, sy)) continue;
        hits++;
        alpha += shaded.alpha;
        tier = Math.max(tier, shaded.tier);
      }
    }
    // The centre ray's tier wins when it hit, so the outline keeps the surface's own tone.
    out.tier[o] = hits ? out.tier[o] || tier : 0;
    out.alpha[o] = hits ? (alpha / hits) * smoothstep(EDGE_IN, EDGE_FULL, hits / (SUB_X * SUB_Y)) : 0;
    if (!out.alpha[o]) out.tier[o] = 0;
  }
}

/**
 * The screen cell's own letter, by the grid's rule: the phrase, or JIROH where the phrase has a gap.
 * Logo cells keep their rest letter, so at rest nothing changes; walls always read JIROH.
 */
function glyphAt(grid: Grid, c: number, r: number, wall: boolean) {
  const i = r * grid.cols + c;
  if (!wall && grid.level[i] >= 2) return grid.chars[i];
  const char = grid.field.chars[i];
  return wall || char === " " || char === "·" ? FILL[(c + r) % FILL.length] : char;
}
