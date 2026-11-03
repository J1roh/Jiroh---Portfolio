type Size = { width: number; height: number };
type Point = { x: number; y: number };
export type Margins = { left: number; top: number; right: number; bottom: number };

/** Points along the move checked for coverage; the move is smooth, so a handful is exact enough. */
const SAMPLES = 10;

/**
 * How far past each edge of the frame a layer must reach so that, moved by ScrollCamera (scaled to `zoom`
 * about `focus` while `focus` glides to the centre), it still covers the whole frame at every point of the move.
 * A frame point V sits in the layer at L + (V − t − L) / s, with t = e·travel·(C − L) and s = 1 + e·(zoom − 1).
 */
export function cameraCover({ width, height }: Size, focus: Point, zoom: number, travel = 1): Margins {
  const centre = { x: width / 2, y: height / 2 };
  let left = 0, top = 0, right = width, bottom = height;
  for (let k = 0; k <= SAMPLES; k++) {
    const e = k / SAMPLES, scale = 1 + e * (zoom - 1);
    const tx = e * travel * (centre.x - focus.x), ty = e * travel * (centre.y - focus.y);
    for (const vx of [0, width]) {
      const x = focus.x + (vx - tx - focus.x) / scale;
      left = Math.min(left, x); right = Math.max(right, x);
    }
    for (const vy of [0, height]) {
      const y = focus.y + (vy - ty - focus.y) / scale;
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  // A cell of slack on each side, so rounding never shows a sliver of page.
  const slack = 16;
  return { left: Math.ceil(-left) + slack, top: Math.ceil(-top) + slack, right: Math.ceil(right - width) + slack, bottom: Math.ceil(bottom - height) + slack };
}
