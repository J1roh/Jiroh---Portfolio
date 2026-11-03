import { clamp } from "../../lib/math/math";
import type { Grid } from "./build-grid";
import { BEVEL_TEXELS, type Volume } from "./logo-volume";

/** How far the bevel tips the face normal outward at the very edge (1 = 45°). */
const BEVEL_TILT = 1;

/**
 * What a ray hit, in the logo's own axes. `tier` is the rest tier for faces (shaded relative to rest)
 * or 0 for walls (shaded absolutely). `t` is the ray parameter, so callers can find the depth.
 * No glyph: letters stay fixed to the screen, so a turning surface never resamples them into seams.
 */
export type Hit = { face: boolean; t: number; nx: number; ny: number; nz: number; tier: number };

/**
 * Casts one ray (origin o, direction d, px around the logo centre) through the extruded logo.
 * Faces are read from the grid, so at rest each cell sees its own tier; walls are found by
 * walking the texel mask (2D DDA) through the slab. Exact at any orientation, with no holes.
 */
export function traceSolid(v: Volume, grid: Grid, cell: { w: number; h: number }, o: readonly number[], d: readonly number[], hit: Hit): boolean {
  const half = v.depth / 2;
  const limits = [v.w / 2, v.h / 2, half];
  let t0 = -Infinity, t1 = Infinity, entry = -1;
  for (let a = 0; a < 3; a++) {
    if (Math.abs(d[a]) < 1e-9) {
      if (Math.abs(o[a]) > limits[a]) return false;
      continue;
    }
    const near = (-Math.sign(d[a]) * limits[a] - o[a]) / d[a];
    const far = (Math.sign(d[a]) * limits[a] - o[a]) / d[a];
    if (near > t0) { t0 = near; entry = a; }
    t1 = Math.min(t1, far);
  }
  if (t0 > t1 || t1 < 0) return false;
  const faceZ = d[2] > 0 ? -1 : 1;

  // Through a face plane, straight onto a logo cell: the face itself.
  if (entry === 2) {
    const px = o[0] + t0 * d[0], py = o[1] + t0 * d[1];
    const c = Math.floor((px + v.cx) / cell.w), r = Math.floor((py + v.cy) / cell.h);
    if (c >= 0 && r >= 0 && c < grid.cols && r < grid.rows && grid.level[r * grid.cols + c] >= 2) {
      const i = r * grid.cols + c;
      return faceHit(v, hit, t0, px, py, faceZ, grid.level[i]);
    }
  }

  // Walk the mask's texels along the ray's xy path until one is solid.
  const fx = (o[0] + t0 * d[0] + v.w / 2) / v.texel, fy = (o[1] + t0 * d[1] + v.h / 2) / v.texel;
  let ix = clamp(Math.floor(fx), 0, v.mw - 1), iy = clamp(Math.floor(fy), 0, v.mh - 1);
  const sx = Math.sign(d[0]), sy = Math.sign(d[1]);
  const dtx = sx ? v.texel / Math.abs(d[0]) : Infinity, dty = sy ? v.texel / Math.abs(d[1]) : Infinity;
  let nextX = sx ? t0 + ((sx > 0 ? ix + 1 - fx : fx - ix) * v.texel) / Math.abs(d[0]) : Infinity;
  let nextY = sy ? t0 + ((sy > 0 ? iy + 1 - fy : fy - iy) * v.texel) / Math.abs(d[1]) : Infinity;
  let t = t0, axis = entry;
  // Entering through a face plane off the grid's logo: that first texel is the face's own outline, not a wall.
  let skip = entry === 2;
  for (;;) {
    if (!skip && v.solid[iy * v.mw + ix]) break;
    skip = false;
    if (nextX < nextY) { t = nextX; ix += sx; nextX += dtx; axis = 0; }
    else { t = nextY; iy += sy; nextY += dty; axis = 1; }
    if (t > t1 || ix < 0 || iy < 0 || ix >= v.mw || iy >= v.mh) return false;
  }


  // A wall: its normal follows the outline's alpha gradient, so curves shade smoothly.
  let nx = alphaAt(v, ix - 1, iy) - alphaAt(v, ix + 1, iy);
  let ny = alphaAt(v, ix, iy - 1) - alphaAt(v, ix, iy + 1);
  if (Math.hypot(nx, ny) < 1e-3) [nx, ny] = axis === 0 ? [-sx, 0] : [0, -sy];
  const length = Math.hypot(nx, ny);
  Object.assign(hit, { face: false, t, nx: nx / length, ny: ny / length, nz: 0, tier: 0 });
  return true;
}

/** A face hit; near the outline its normal tips outward like the model's rounded bevel. */
function faceHit(v: Volume, hit: Hit, t: number, px: number, py: number, nz: number, tier: number) {
  const tx = Math.floor((px + v.w / 2) / v.texel), ty = Math.floor((py + v.h / 2) / v.texel);
  const edge = edgeAt(v, tx, ty);
  const bevel = clamp((BEVEL_TEXELS - edge) / (BEVEL_TEXELS - 1), 0, 1) * BEVEL_TILT;
  let ox = edgeAt(v, tx - 1, ty) - edgeAt(v, tx + 1, ty);
  let oy = edgeAt(v, tx, ty - 1) - edgeAt(v, tx, ty + 1);
  const out = Math.hypot(ox, oy);
  ox = out > 1e-6 ? (ox / out) * bevel : 0;
  oy = out > 1e-6 ? (oy / out) * bevel : 0;
  const length = Math.hypot(ox, oy, 1);
  Object.assign(hit, { face: true, t, nx: ox / length, ny: oy / length, nz: nz / length, tier });
  return true;
}

function alphaAt(v: Volume, x: number, y: number) {
  return x < 0 || y < 0 || x >= v.mw || y >= v.mh ? 0 : v.alpha[y * v.mw + x];
}

function edgeAt(v: Volume, x: number, y: number) {
  return x < 0 || y < 0 || x >= v.mw || y >= v.mh ? 0 : v.edge[y * v.mw + x];
}
