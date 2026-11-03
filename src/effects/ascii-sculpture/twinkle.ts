import type { Grid } from "./build-grid";
import type { GlyphAtlas } from "./glyph-atlas";
import { cellX, WHITE, type Layout } from "./paint-base";

/** Twinkle steps per second; a white logo cell flickers through glyphs while its slow gate is open. */
export const TWINKLE_HZ = 2.5;
export const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*+/=<>";
const TWINKLE_GATE_HZ = 0.18;

/** Flickers the twinkling logo cells over the cached base, while the logo rests flat. */
export function paintTwinkles(context: CanvasRenderingContext2D, grid: Grid, atlas: GlyphAtlas, layout: Layout, time: number) {
  for (const i of grid.twinkles) {
    const char = twinkleChar(grid.hash[i], time);
    if (!char) continue;
    const c = i % grid.cols;
    const x = cellX(c, layout);
    const y = ((i - c) / grid.cols) * layout.h;
    context.clearRect(x, y, cellX(c + 1, layout) - x, layout.h);
    atlas.draw(context, char, WHITE, x, y);
  }
}

/** The random glyph a twinkling cell shows right now, or null while its slow gate is closed. */
export function twinkleChar(noise: number, time: number): string | null {
  if (noise <= 0.985 || Math.sin(time * TWINKLE_GATE_HZ * Math.PI * 2 + noise * 1000) <= 0) return null;
  return GLYPHS[Math.floor(noise * 1e4 + Math.floor(time * TWINKLE_HZ)) % GLYPHS.length];
}
