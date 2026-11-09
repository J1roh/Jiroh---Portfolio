import { useEffect, useRef } from "react";
import { readCssVar } from "../../lib/tokens/read-css-var";
import "./glyph-backdrop.css";

const CELL_PX = 16;
/** Share of cells with a glyph; the rest stay empty so the rows read as texture, not text. */
const DENSITY = 0.5;

/**
 * The faint ASCII rows behind every Figma v4.1 section: one fixed canvas, drawn once per resize, never animated.
 * Sections with their own surface (hero photo, footer) simply cover it.
 */
export function GlyphBackdrop({ glyphs }: { glyphs: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${CELL_PX * 0.8}px ${readCssVar("--font-mono")}`;
      ctx.fillStyle = readCssVar("--color-field");
      ctx.textBaseline = "top";
      const cw = CELL_PX * 0.62;
      for (let y = 0; y < h; y += CELL_PX) {
        for (let x = 0; x < w; x += cw) {
          if (Math.random() < DENSITY) ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], x, y);
        }
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [glyphs]);

  return <canvas ref={ref} className="glyph-backdrop" aria-hidden="true" />;
}
