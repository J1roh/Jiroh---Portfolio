/** The glyph grid: one character per cell, and whether the cell falls inside the big letters. */
export type Cells = { cols: number; rows: number; cw: number; ch: number; chars: string[]; inside: boolean[] };

const CELL_PX = 14;
/** Faint field: share of outside cells that get a glyph at all. */
const FIELD_DENSITY = 0.35;
const POINTER_RADIUS = 90;

const pick = (glyphs: string) => glyphs[Math.floor(Math.random() * glyphs.length)];

/** Lays the grid over a w × h box and marks the cells covered by `text`, set bold on up to two lines. */
export function buildCells(w: number, h: number, text: string, glyphs: string, font: string): Cells {
  const cw = CELL_PX * 0.62, ch = CELL_PX;
  const cols = Math.max(1, Math.floor(w / cw)), rows = Math.max(1, Math.floor(h / ch));
  const mask = document.createElement("canvas");
  mask.width = cols; mask.height = rows;
  const m = mask.getContext("2d");
  const inside: boolean[] = new Array(cols * rows).fill(false);
  if (m) {
    const lines = text.split(" ");
    // Letters are drawn in cell units; cells are taller than wide, so squash the type to keep its proportions.
    const size = Math.min(rows / (lines.length * 1.05), (cols * 0.62) / Math.max(...lines.map((l) => l.length * 0.62)));
    m.font = `bold ${size}px ${font}`;
    m.textBaseline = "top";
    lines.forEach((line, i) => {
      m.save();
      m.scale(1 / 0.62, 1);
      m.fillText(line, (cols * 0.62 - m.measureText(line).width) / 2, i * size * 1.02 + (rows - lines.length * size) / 2);
      m.restore();
    });
    const data = m.getImageData(0, 0, cols, rows).data;
    for (let i = 0; i < inside.length; i++) inside[i] = data[i * 4 + 3] > 110;
  }
  const chars = inside.map((on) => (on || Math.random() < FIELD_DENSITY ? pick(glyphs) : ""));
  return { cols, rows, cw, ch, chars, inside };
}

/** Paints the grid: letter cells bright, the rest faint; cells near the pointer glow. */
export function drawCells(ctx: CanvasRenderingContext2D, c: Cells, ink: string, font: string, pointer: { x: number; y: number } | null) {
  ctx.clearRect(0, 0, c.cols * c.cw, c.rows * c.ch);
  ctx.font = `${CELL_PX * 0.85}px ${font}`;
  ctx.textBaseline = "top";
  ctx.fillStyle = ink;
  for (let r = 0; r < c.rows; r++) {
    for (let k = 0; k < c.cols; k++) {
      const i = r * c.cols + k;
      const glyph = c.chars[i];
      if (!glyph) continue;
      const x = k * c.cw, y = r * c.ch;
      let alpha = c.inside[i] ? 0.8 : 0.07;
      if (pointer) {
        const d = Math.hypot(pointer.x - x, pointer.y - y);
        if (d < POINTER_RADIUS) alpha = Math.min(1, alpha + (1 - d / POINTER_RADIUS) * 0.5);
      }
      ctx.globalAlpha = alpha;
      ctx.fillText(glyph, x, y);
    }
  }
  ctx.globalAlpha = 1;
}
