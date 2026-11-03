import type { Grid } from "./build-grid";
import type { GlyphAtlas } from "./glyph-atlas";

export type Layout = { w: number; h: number; dpr: number };
/** Tone index of the white glyphs (logo body). */
export const WHITE = 2;
/** Most device pixels a sculpture canvas may hold (the canvas and its cached base each, about 32 MB apiece). */
const PIXEL_BUDGET = 8e6;

/** Device pixel ratio for a canvas this size (css px), capped so a field drawn larger than the screen stays affordable. */
export const canvasDpr = (width: number, height: number) => Math.min(devicePixelRatio, Math.sqrt(PIXEL_BUDGET / Math.max(1, width * height)));

/** Snaps a cell's left edge to a device pixel so glyphs stay crisp on a 7.2 px grid. */
export const cellX = (c: number, layout: Layout) => Math.round(c * layout.w * layout.dpr) / layout.dpr;

/** The resting field: every glyph at its tier colour and resting opacity. Painted once per build. */
export function paintBase(context: CanvasRenderingContext2D, grid: Grid, atlas: GlyphAtlas, layout: Layout) {
  context.clearRect(0, 0, grid.cols * layout.w, grid.rows * layout.h);
  for (let i = 0; i < grid.level.length; i++) {
    if (grid.level[i] === 0) continue;
    context.globalAlpha = grid.rest[i];
    atlas.draw(context, grid.chars[i], grid.level[i] - 1, cellX(i % grid.cols, layout), Math.floor(i / grid.cols) * layout.h);
  }
  context.globalAlpha = 1;
}

/**
 * Copies the cached field pixel for pixel. Drawn at its own size: scaling it to the grid
 * (which overhangs the canvas by up to a cell) shifted it against the redrawn cells and doubled glyphs.
 */
export function copyBase(context: CanvasRenderingContext2D, base: HTMLCanvasElement, layout: Layout) {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, base.width, base.height);
  context.drawImage(base, 0, 0);
  context.setTransform(layout.dpr, 0, 0, layout.dpr, 0, 0);
}
