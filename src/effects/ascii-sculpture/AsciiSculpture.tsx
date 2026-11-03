import { useEffect, useRef, type CSSProperties } from "react";
import type { MotionValue } from "motion/react";
import { createSculpture, type Sculpture } from "./create-sculpture";
import "./ascii-sculpture.css";

type AsciiSculptureProps = {
  /** Logo image; its alpha decides which cells are body, edge or background. */
  src: string;
  /** What the logo is, for screen readers. */
  label: string;
  /** Text the grid is typed from. Changing it retypes the field with a ripple. */
  phrase: string;
  /** Logo placement as fractions of the canvas: left, top, width. */
  placement: { x: number; y: number; w: number };
  /** Chip that follows the pointer while hovering; empty for none. */
  cursorLabel: string;
  className?: string;
  /** Box overrides for the container, e.g. a field drawn larger than its stage. */
  style?: CSSProperties;
  /** Off: the logo drawn once, still. */
  enabled: boolean;
  /** The colour theme; when it changes the field is redrawn in the new colours. */
  theme: string;
  /** A scroll value (0..1) that plays the drop's rings from the logo: forward plays, back rewinds. */
  scrub?: MotionValue<number>;
  /** A scroll value (0..1) that turns the logo one full 360°; flat at both ends. */
  turn?: MotionValue<number>;
  /** Cylinder bow strength, about 0.12 at rest down to 0 (flat). */
  warp?: MotionValue<number>;
  /** A sweeping edge in canvas px (negative for none): rows it reaches scramble briefly. */
  edge?: MotionValue<number>;
};

/**
 * The logo typed out in monospace across a full field of phrase text.
 * The logo can turn in 3D; only the "look" and "flick" motions follow the pointer, and only then are pointer listeners attached for it.
 * Moving over the field can leave a trail of water rings (off for now).
 */
export function AsciiSculpture({ src, label, phrase, placement, cursorLabel, className, style, enabled, theme, scrub, turn, warp, edge }: AsciiSculptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const engine = useRef<Sculpture | null>(null);
  const phraseRef = useRef(phrase);
  const { x: left, y: top, w: width } = placement;

  useEffect(() => {
    const canvas = canvasRef.current;
    const chip = chipRef.current;
    if (!canvas || !chip) return;
    const sculpture = createSculpture(canvas, { src, phrase: phraseRef.current, placement: { x: left, y: top, w: width }, live: enabled });
    engine.current = sculpture;
    // Canvas px, undoing any CSS scale on the way (a scroll camera may be zooming the field).
    const local = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scale = rect.width / (canvas.offsetWidth || 1);
      return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const at = local(event);
      if (sculpture.followsPointer) sculpture.hover(at);
      sculpture.drag(at);
      chip.style.translate = `${at.x}px ${at.y}px`;
      chip.dataset.shown = cursorLabel ? "true" : "false";
    };
    const look = (event: PointerEvent) => sculpture.look(event.pointerType === "touch" ? null : local(event));
    const away = () => sculpture.look(null);
    const leave = () => {
      chip.dataset.shown = "false";
      sculpture.release();
    };
    const press = (event: PointerEvent) => sculpture.click(local(event));

    let entered = false;
    const visibility = new IntersectionObserver(([entry]) => {
      sculpture.setVisible(entry.isIntersecting);
      if (entry.isIntersecting && !entered) { entered = true; void sculpture.enter(); }
    });
    let resizeTimer = 0;
    const resize = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(sculpture.resize, 120);
    });
    visibility.observe(canvas);
    resize.observe(canvas);
    if (enabled) {
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerleave", leave);
      canvas.addEventListener("pointerdown", press);
    }
    if (enabled && sculpture.followsPointer) {
      window.addEventListener("pointermove", look);
      document.documentElement.addEventListener("pointerleave", away);
    }
    return () => {
      engine.current = null;
      sculpture.destroy();
      window.clearTimeout(resizeTimer);
      visibility.disconnect();
      resize.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", press);
      window.removeEventListener("pointermove", look);
      document.documentElement.removeEventListener("pointerleave", away);
    };
    // Phrase changes go through setPhrase below, so the field is retyped without a rebuild of the engine.
  }, [src, left, top, width, enabled, cursorLabel]);

  // Scroll scrubs the drop's rings: forward plays them, back rewinds.
  useEffect(() => {
    if (!scrub) return;
    engine.current?.scrub(scrub.get());
    return scrub.on("change", (value) => engine.current?.scrub(value));
  }, [scrub, src, left, top, width, enabled]);

  // Scroll turns the logo round once.
  useEffect(() => {
    if (!turn) return;
    engine.current?.turn(turn.get());
    return turn.on("change", (value) => engine.current?.turn(value));
  }, [turn, src, left, top, width, enabled]);

  // Scroll flattens the bow and sweeps the mask edge across the rows.
  useEffect(() => {
    if (!warp) return;
    engine.current?.setWarp(warp.get());
    return warp.on("change", (value) => engine.current?.setWarp(value));
  }, [warp, src, left, top, width, enabled]);
  useEffect(() => {
    if (!edge) return;
    return edge.on("change", (value) => engine.current?.edge(value < 0 ? null : value));
  }, [edge, src, left, top, width, enabled]);

  // The colours are CSS tokens read at build time, so a theme switch is a rebuild.
  useEffect(() => { engine.current?.resize(); }, [theme]);

  useEffect(() => {
    phraseRef.current = phrase;
    engine.current?.setPhrase(phrase);
  }, [phrase]);

  return (
    <div className={["ascii-sculpture", className].filter(Boolean).join(" ")} style={style}>
      <canvas ref={canvasRef} className="ascii-sculpture__canvas" role="img" aria-label={label} />
      <span ref={chipRef} className="ascii-sculpture__chip" data-shown="false" aria-hidden="true">{cursorLabel}</span>
    </div>
  );
}
