import type { AlphaSampler, Box, Grid } from "./build-grid";

/** Thickness over width, from the Blender model (Other/Blender/flag_mark_clean.obj: 0.336 / 2.012). */
const DEPTH_RATIO = 0.167;
/** Mask texel size, in cell widths: half a cell, so curved walls shade smoothly. */
const TEXEL_CELLS = 0.5;
/** Alpha above this is solid; matches the grid's EDGE so the walls meet the front face's outline. */
const SOLID = 0.2;
/** Bevel width in texels. The model's is 0.4% of the width; it is widened to about a cell so the rim reads as glyphs. */
export const BEVEL_TEXELS = 2.5;

/**
 * The logo as an extruded solid, in px around its centre: z runs from −depth/2 (the front face,
 * nearest the eye) to +depth/2. The outline is a square texel mask sampled from the logo's alpha.
 */
export type Volume = {
  cx: number;
  cy: number;
  /** Logo box size and thickness, px. */
  w: number;
  h: number;
  depth: number;
  texel: number;
  mw: number;
  mh: number;
  alpha: Float32Array;
  solid: Uint8Array;
  /** Texels to the nearest empty texel, capped at BEVEL_TEXELS. */
  edge: Float32Array;
  /** Flat logo bounds in grid cells, inclusive. */
  bounds: { c0: number; r0: number; c1: number; r1: number };
};

export function buildVolume(grid: Grid, sample: AlphaSampler, box: Box, cell: { w: number; h: number }): Volume {
  const texel = TEXEL_CELLS * cell.w;
  const mw = Math.ceil(box.w / texel);
  const mh = Math.ceil(box.h / texel);
  const alpha = new Float32Array(mw * mh);
  const solid = new Uint8Array(mw * mh);
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const u = ((x + 0.5) * texel) / box.w, v = ((y + 0.5) * texel) / box.h;
      const a = u < 1 && v < 1 ? sample(u, v) : 0;
      alpha[y * mw + x] = a;
      solid[y * mw + x] = a > SOLID ? 1 : 0;
    }
  }

  const bounds = { c0: grid.cols, r0: grid.rows, c1: -1, r1: -1 };
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (grid.level[r * grid.cols + c] < 2) continue;
      bounds.c0 = Math.min(bounds.c0, c); bounds.c1 = Math.max(bounds.c1, c);
      bounds.r0 = Math.min(bounds.r0, r); bounds.r1 = Math.max(bounds.r1, r);
    }
  }

  return {
    cx: box.x + box.w / 2, cy: box.y + box.h / 2,
    w: box.w, h: box.h, depth: DEPTH_RATIO * box.w,
    texel, mw, mh, alpha, solid, edge: edgeDistance(solid, mw, mh), bounds,
  };
}

/** Two-pass chamfer distance (1, √2) from each solid texel to the nearest empty one, capped. */
function edgeDistance(solid: Uint8Array, mw: number, mh: number) {
  const edge = new Float32Array(mw * mh);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= mw || y >= mh ? 0 : edge[y * mw + x]);
  for (let i = 0; i < edge.length; i++) edge[i] = solid[i] ? BEVEL_TEXELS : 0;
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const i = y * mw + x;
      if (!solid[i]) continue;
      edge[i] = Math.min(edge[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + Math.SQRT2, at(x + 1, y - 1) + Math.SQRT2);
    }
  }
  for (let y = mh - 1; y >= 0; y--) {
    for (let x = mw - 1; x >= 0; x--) {
      const i = y * mw + x;
      if (!solid[i]) continue;
      edge[i] = Math.min(edge[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + Math.SQRT2, at(x - 1, y + 1) + Math.SQRT2);
    }
  }
  return edge;
}
