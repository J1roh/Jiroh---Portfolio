/**
 * Pre-renders every glyph in every tier colour once, so each frame is cheap drawImage copies
 * instead of thousands of fillText calls.
 */
export function createGlyphAtlas(chars: string, colors: string[], cell: { w: number; h: number; font: string }) {
  const unique = [...new Set(chars)];
  const scale = devicePixelRatio;
  const sw = Math.ceil(cell.w * scale);
  const sh = Math.ceil(cell.h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = sw * unique.length;
  canvas.height = sh * colors.length;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("ascii-sculpture: 2D canvas is not available");
  // Each glyph gets a whole-pixel slot so source rectangles never drift across the atlas.
  const slotW = sw / scale;
  const slotH = sh / scale;
  // Slots are a touch wider than the cell; shift left so each glyph stays centred on its cell.
  const inset = (slotW - cell.w) / 2;
  context.scale(scale, scale);
  context.font = cell.font;
  context.textBaseline = "middle";
  context.textAlign = "center";

  const column = new Map<string, number>();
  unique.forEach((char, index) => {
    column.set(char, index);
    colors.forEach((color, row) => {
      context.fillStyle = color;
      context.fillText(char, index * slotW + slotW / 2, row * slotH + slotH / 2);
    });
  });

  /** Copies `char` in colour `tone` to (x, y) in CSS px. Unknown characters are skipped. */
  const draw = (target: CanvasRenderingContext2D, char: string, tone: number, x: number, y: number) => {
    const index = column.get(char);
    if (index === undefined) return;
    target.drawImage(canvas, index * sw, tone * sh, sw, sh, x - inset, y, slotW, slotH);
  };
  return { draw };
}

export type GlyphAtlas = ReturnType<typeof createGlyphAtlas>;
