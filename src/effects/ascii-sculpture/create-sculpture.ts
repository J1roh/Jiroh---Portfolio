import { readCssVar } from "../../lib/tokens/read-css-var";
import { buildGrid, loadAlpha, type Grid } from "./build-grid";
import { createGlyphAtlas, type GlyphAtlas } from "./glyph-atlas";
import { canvasDpr, copyBase, paintBase, type Layout } from "./paint-base";
import { paintFrame } from "./paint-frame";
import { TWINKLE_HZ } from "./twinkle";
import { RIPPLE_S, WAKE_S, type Ripple, type Wake } from "./waves";
import { buildVolume, type Volume } from "./logo-volume";
import { buildPulseField, LOGO_PULSE, pulseAt, type PulseField } from "./logo-pulse";
import { createOverlay, projectLogo, type Overlay } from "./project-logo";
import { createLogoMotion } from "./logo-motion";
import { sculpturePointer } from "./sculpture-pointer";
import { dropRipples } from "./drop-ripple";
import { createLogoWake } from "./logo-wake";
import { createSculptureLoop } from "./create-sculpture-loop";
import { createRetypeQueue } from "./retype-queue";
import { createCylinderWarp } from "./cylinder-warp";
import { createRowScramble } from "./row-scramble";
import { createScrollTurn } from "./scroll-turn";

export type SculptureOptions = {
  src: string;
  phrase: string;
  /** Logo placement as fractions of the canvas: left, top, width. */
  placement: { x: number; y: number; w: number };
  /** Animated, or painted once and left still. */
  live: boolean;
};

const MAX_RIPPLES = 16;
/** Off for now (owner, 2026-10-31): no water wakes from the tilting logo. */
const LOGO_WAKE = false;
const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*+/=<>JIROH";

/** The sculpture's engine: builds the grid, caches the resting field, and repaints only what moves. */
export function createSculpture(canvas: HTMLCanvasElement, options: SculptureOptions) {
  const base = document.createElement("canvas");
  const context = canvas.getContext("2d"), baseContext = base.getContext("2d");
  if (!context || !baseContext) throw new Error("ascii-sculpture: 2D canvas is not available");
  const styles = getComputedStyle(canvas);
  const size = parseFloat(styles.getPropertyValue("--sculpture-size"));
  const layout: Layout = { w: size * 0.6, h: parseFloat(styles.getPropertyValue("--sculpture-line")), dpr: devicePixelRatio };
  const font = `${size}px ${readCssVar("--font-mono")}`;

  const ripples: Ripple[] = [], wakes: Wake[] = [];
  const motion = createLogoMotion(options.live);
  const logoWake = createLogoWake();
  const warp = createCylinderWarp(), scramble = createRowScramble(), scrollTurn = createScrollTurn();
  let warpK = 0;
  const ready = Promise.all([loadAlpha(options.src), document.fonts.load(font)]).then(([logo]) => logo);
  let phrase = options.phrase;
  let scene: { grid: Grid; atlas: GlyphAtlas; volume: Volume; overlay: Overlay; pulseField: PulseField; centre: { x: number; y: number } } | null = null;
  let lastTwinkle = -1, lastTime = 0, retypeRippleAt = -Infinity, dirty = true, dropAt = 0;

  const loop = createSculptureLoop({
    live: options.live,
    draw: (time, live) => {
      if (!scene) return;
      const dt = Math.min(time - lastTime, 1 / 30);
      motion.step(dt); lastTime = time;
      if (LOGO_WAKE) logoWake.step(motion, scene.volume, layout, dt, time, wakes);
      while (ripples.length && time - ripples[0].start > RIPPLE_S) ripples.shift();
      while (wakes.length && time - wakes[0].start > WAKE_S) wakes.shift();
      const twinkle = Math.floor(time * TWINKLE_HZ);
      // A scroll-driven turn wins over the logo's own motion while it is partway round.
      const scrolled = scrollTurn.active();
      const turned = scrolled || !motion.settled();
      const pulse = LOGO_PULSE && live ? pulseAt(time, scene.pulseField) : null;
      const busy = motion.moving() || wakes.length > 0 || ripples.length > 0 || pulse !== null || scramble.active(time);
      // Frames where nothing moves (logo still, no wake, no ripple, same twinkle step) change nothing, so skip them.
      if (!dirty && !busy && twinkle === lastTwinkle) return;
      lastTwinkle = twinkle;
      dirty = busy;
      const { grid, atlas, volume, overlay } = scene;
      const drops = dropAt > 0 && dropAt < 1 ? dropRipples(dropAt, scene.centre, grid.cols / 2) : undefined;
      if (turned) projectLogo(volume, grid, layout, scrolled ? scrollTurn.read() : motion.read(), overlay);
      if (live) paintFrame(context, base, grid, atlas, layout, { time, ripples, wakes, overlay: turned ? overlay : null, pulse, drops });
      else copyBase(context, base, layout);
      scramble.paint(context, grid, atlas, layout, time);
      warp(context, warpK, layout.dpr);
    },
  });

  const build = async () => {
    const logo = await ready;
    // Layout size, not the on-screen rect: a scroll camera may be scaling the canvas right now.
    const { offsetWidth: width, offsetHeight: height } = canvas;
    layout.dpr = canvasDpr(width, height);
    for (const [target, ctx] of [[canvas, context], [base, baseContext]] as const) {
      Object.assign(target, { width: Math.round(width * layout.dpr), height: Math.round(height * layout.dpr) });
      ctx.setTransform(layout.dpr, 0, 0, layout.dpr, 0, 0);
    }
    const cols = Math.ceil(width / layout.w), rows = Math.ceil(height / layout.h);
    const w = options.placement.w * width, box = { x: options.placement.x * width, y: options.placement.y * height, w, h: w * logo.aspect };
    const grid = buildGrid({ cols, rows, cw: layout.w, ch: layout.h }, box, logo.sample, phrase);
    // Read on every build (the styles object is live), so a theme switch only needs a rebuild.
    const tones = ["--sculpture-field", "--sculpture-edge", "--sculpture-body"].map((name) => styles.getPropertyValue(name));
    const atlas = createGlyphAtlas(phrase + SCRAMBLE, tones, { ...layout, font });
    const volume = buildVolume(grid, logo.sample, box, layout);
    paintBase(baseContext, grid, atlas, layout);
    const centre = { x: (box.x + box.w / 2) / layout.w, y: (box.y + box.h / 2) / layout.h };
    scene = { grid, atlas, volume, overlay: createOverlay(volume, grid, layout), pulseField: buildPulseField(grid, layout), centre };
    dirty = true;
    loop.redraw();
    return centre;
  };

  const ripple = (x: number, y: number, reveal = false) => {
    ripples.push({ start: loop.now(), x, y, reveal });
    if (ripples.length > MAX_RIPPLES) ripples.shift();
    loop.wake();
  };

  /** Retypes the field, with one ripple from the logo unless a retype ripple is still running. */
  const retype = createRetypeQueue(async (next) => {
    if (next === phrase) return;
    phrase = next;
    if (!scene) return;
    const centre = await build();
    if (!options.live || loop.now() - retypeRippleAt < RIPPLE_S) return;
    retypeRippleAt = loop.now();
    ripple(centre.x, centre.y);
  });

  return {
    /** First paint; with `live`, the field is revealed by a ripple from the logo's centre. */
    enter: async () => {
      const centre = await build();
      if (options.live) ripple(centre.x, centre.y, true);
    },
    /** Rebuilds at the new size, or with new colours after a theme switch. */
    resize: () => { if (scene) void build(); },
    setVisible: loop.setVisible,
    /** Asks for the field to be retyped from a new phrase; coalesced by the retype queue. */
    setPhrase: retype.request,
    /** Scroll-driven progress of the drop's rings from the logo (0..1, drop-ripple.ts); repaints only when it changes. */
    scrub: (value: number) => { if (value !== dropAt) { dropAt = value; dirty = true; loop.wake(); } },
    /** Scroll-driven 360° turn of the logo (scroll-turn.ts), 0..1; repaints only when it changes. Live only. */
    turn: (t: number) => { if (options.live && scrollTurn.set(t)) { dirty = true; loop.wake(); } },
    /** Cylinder bow strength (cylinder-warp.ts); 0 is flat. */
    setWarp: (k: number) => { if (k !== warpK) { warpK = k; dirty = true; if (options.live) loop.wake(); else loop.redraw(); } },
    /** A sweeping edge (the hero's closing mask) at `y` canvas px, or null: rows it reaches scramble briefly. */
    edge: (y: number | null) => { if (scene && options.live) { scramble.pass(y, scene.grid.rows, layout, loop.now()); loop.wake(); } },
    ...sculpturePointer({ layout, motion, wakes, volume: () => scene?.volume ?? null, now: loop.now, wake: loop.wake, ripple, live: options.live }),
    /** Stops for good: hidden loops never restart, even if a late ripple or build arrives. */
    destroy: () => { retype.cancel(); loop.setVisible(false); },
  };
}

export type Sculpture = ReturnType<typeof createSculpture>;
