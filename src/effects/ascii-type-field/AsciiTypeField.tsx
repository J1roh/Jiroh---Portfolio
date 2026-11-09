import { useEffect, useRef } from "react";
import { readCssVar } from "../../lib/tokens/read-css-var";
import { buildCells, drawCells, type Cells } from "./cells";
import "./ascii-type-field.css";

type AsciiTypeFieldProps = {
  /** Set large in the field; a space breaks it onto a second line. */
  text: string;
  glyphs: string;
  className?: string;
  /** Off: drawn once, no re-randomising and no pointer glow. */
  enabled: boolean;
};

/** Re-randomise this share of the letter glyphs each tick. */
const CHURN = 0.04;
const TICK_MS = 120;

/**
 * A field of monospace glyphs on one canvas where `text` reads out of the brighter glyphs (Figma "Enquire band ·
 * ASCII (Concept D)"). Letter glyphs churn slowly; the pointer brightens glyphs near it. Only runs while on screen.
 */
export function AsciiTypeField({ text, glyphs, className, enabled }: AsciiTypeFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let cells: Cells | null = null;
    let pointer: { x: number; y: number } | null = null;
    let timer = 0;
    const ink = readCssVar("--color-ink");
    const font = readCssVar("--font-mono");

    const layout = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = buildCells(canvas.offsetWidth, canvas.offsetHeight, text, glyphs, font);
      drawCells(ctx, cells, ink, font, pointer);
    };
    const tick = () => {
      if (!cells) return;
      for (let i = 0; i < cells.chars.length; i++) {
        if (cells.inside[i] && Math.random() < CHURN) cells.chars[i] = glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      drawCells(ctx, cells, ink, font, pointer);
    };
    const move = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - box.left, y: e.clientY - box.top };
    };
    const leave = () => { pointer = null; };

    layout();
    const resize = new ResizeObserver(layout);
    resize.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (enabled && entry.isIntersecting) timer = window.setInterval(tick, TICK_MS);
    });
    seen.observe(canvas);
    if (enabled) { canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave); }
    return () => {
      window.clearInterval(timer); resize.disconnect(); seen.disconnect();
      canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave);
    };
  }, [text, glyphs, enabled]);

  return <canvas ref={ref} className={["ascii-type-field", className].filter(Boolean).join(" ")} aria-hidden="true" />;
}
