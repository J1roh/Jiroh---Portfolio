import type { Grid } from "./build-grid";
import type { GlyphAtlas } from "./glyph-atlas";
import { cellX, type Layout } from "./paint-base";
import { GLYPHS } from "./twinkle";

/** How long a row scrambles, s; how fast its glyphs change; how many rows ahead of the edge it starts. */
const SCRAMBLE_S = 0.12;
const SCRAMBLE_HZ = 24;
const LEAD_ROWS = 2;

/**
 * Rows scramble briefly as an edge (the hero's closing mask) sweeps past them, so the field seems to
 * dissolve into it. Feed the edge's position each scroll step; paint after the frame.
 */
export function createRowScramble() {
  let until = new Float32Array(0);
  let lastRow: number | null = null;

  return {
    /** The edge is at `y` px in the canvas (null when there is no edge); rows it reaches start scrambling. */
    pass: (y: number | null, rows: number, layout: Layout, now: number) => {
      if (until.length !== rows) until = new Float32Array(rows);
      if (y === null) { lastRow = null; return; }
      const row = Math.floor(y / layout.h) - LEAD_ROWS;
      if (lastRow !== null && row !== lastRow) {
        const from = Math.max(0, Math.min(row, lastRow)), to = Math.min(rows - 1, Math.max(row, lastRow));
        for (let r = from; r <= to; r++) until[r] = now + SCRAMBLE_S;
      }
      lastRow = row;
    },
    active: (now: number) => until.some((end) => end > now),
    paint: (context: CanvasRenderingContext2D, grid: Grid, atlas: GlyphAtlas, layout: Layout, now: number) => {
      for (let r = 0; r < until.length && r < grid.rows; r++) {
        if (until[r] <= now) continue;
        const y = r * layout.h;
        context.clearRect(0, y, grid.cols * layout.w, layout.h);
        for (let c = 0; c < grid.cols; c++) {
          const i = r * grid.cols + c;
          if (grid.level[i] === 0) continue;
          context.globalAlpha = grid.rest[i];
          atlas.draw(context, GLYPHS[Math.floor(grid.hash[i] * 7919 + now * SCRAMBLE_HZ) % GLYPHS.length], grid.level[i] - 1, cellX(c, layout), y);
        }
      }
      context.globalAlpha = 1;
    },
  };
}
