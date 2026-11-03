import { useCallback, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";
import { cameraCover, ScrollCamera } from "../../animations/scroll-camera";
import { readEasing } from "../../lib/motion/read-motion-token";
import { useElementSize } from "../../lib/viewport/use-element-size";
import { maskCover } from "./HeroTransition";

type Placement = { x: number; y: number; w: number };
type SculptureExtras = { style?: CSSProperties; turn?: MotionValue<number>; warp?: MotionValue<number>; edge?: MotionValue<number> };
type Range = [number, number];
/** Moves the line-art logo with the ASCII logo while it is still panning and dropping. */
export type LogoMotion = { x: MotionValue<number>; y: MotionValue<number>; scale: MotionValue<number> };

type HeroCameraStageProps = {
  /** 0..1 through the whole pinned scroll (lib/scroll/use-pin-progress). */
  progress: MotionValue<number>;
  /** The logo's resting placement on the stage, as canvas fractions. */
  placement: Placement;
  /** The logo's height / width. */
  aspect: number;
  renderSculpture: (placement: Placement, extras: SculptureExtras) => ReactNode;
  /** The copy, sliding out on the move's progress. */
  renderCopy: (move: MotionValue<number>) => ReactNode;
  /**
   * The closing mask, on its own progress, given where the dropped logo finally sits on screen (px) and how to
   * move from there to where the logo is now.
   */
  renderTransition: (close: MotionValue<number>, logoBox: { x: number; y: number; w: number; h: number } | null, logoMotion: LogoMotion) => ReactNode;
  /** Text tiled huge and faint behind the field once the scene flattens. */
  wordmark: string;
};

/**
 * Scroll sequence, on one canvas so the ASCII grid stays one letter size (parallax layers broke it). One flow, not
 * phase by phase (owner, 2026-10-31): the copy slides out as the field pans the logo to the centre, the logo turning
 * a full 360° on the way; as it arrives the scene zooms out a little, as if the logo dropped; then a light grid mask
 * rises flat-topped (owner, 2026-11-03: back from the Glyph tide) and covers it, turning the logo to line art where it passes.
 * No splash for now (owner, 2026-10-31): the drop's ripple (drop-ripple.ts) is not passed in.
 * `PINNED_SCREENS` must match the extra height on `.hero--camera` in hero.css.
 */
export const PINNED_SCREENS = 2.4;
/** Overlapping stretches of the pinned progress; the turn rides the move. */
const FLOW: { move: Range; drop: Range; tiles: Range; close: Range } = {
  move: [0, 0.45],
  drop: [0.4, 0.6],
  tiles: [0.4, 0.8],
  close: [0.3, 1],
};
/** The scene's scale after the drop, and its fall: slow, then fast (cubic ease-in). */
const DROP_ZOOM = 0.88;
const FALL = cubicBezier(0.55, 0, 1, 0.45);
/** At rest the field bows as if on a cylinder (Alche); the bow flattens over the move, power2.out. */
const WARP_K = 0.12;
const FLATTEN = cubicBezier(0.33, 1, 0.68, 1);
/** The ghost wordmark stays a faint backdrop: field colour at this opacity. */
const TILES_OPACITY = 0.22;

/** The hero's pinned stage on wide screens: one field canvas under a pan, then a small zoom-out. */
export function HeroCameraStage({ progress, placement, aspect, renderSculpture, renderCopy, renderTransition, wordmark }: HeroCameraStageProps) {
  const root = useRef<HTMLDivElement>(null);
  const size = useElementSize(root);
  const move = useTransform(progress, FLOW.move, [0, 1]);
  const drop = useTransform(progress, FLOW.drop, [1, DROP_ZOOM], { ease: FALL });
  const close = useTransform(progress, FLOW.close, [0, 1]);
  const scrim = useTransform(move, [0, 1], [1, 0]);
  const warp = useTransform(progress, FLOW.move, [WARP_K, 0], { ease: FLATTEN });
  const tiles = useTransform(progress, FLOW.tiles, [0, TILES_OPACITY]);
  // The pan as ScrollCamera eases it, so the line-art logo and the mask edge can follow the field; the logo's turn rides it too.
  const pan = useTransform(move, [0, 1], [0, 1], { ease: cubicBezier(...readEasing("in-out")) });
  const geometry = useRef({ width: 0, height: 0, focusX: 0, focusY: 0, coverTop: 0 });
  // The mask's top edge in the field canvas's px (screen → undo the pan, then the drop's zoom about the logo), so rows scramble as it passes.
  const edge = useTransform(() => {
    const cover = maskCover(close.get()), { height, focusY, coverTop } = geometry.current;
    if (cover <= 0 || cover >= 1 || !height) return -1;
    const panY = pan.get() * (height / 2 - focusY);
    return ((1 - cover) * height - panY - focusY) / drop.get() + focusY + coverTop;
  });
  // The logo's offset from its final, centred place, and its scale against the full drop.
  const logoMotion: LogoMotion = {
    x: useTransform(() => (1 - pan.get()) * (geometry.current.focusX - geometry.current.width / 2)),
    y: useTransform(() => (1 - pan.get()) * (geometry.current.focusY - geometry.current.height / 2)),
    scale: useTransform(drop, (value) => value / DROP_ZOOM),
  };

  // The logo's centre on the stage, from the same placement the sculpture uses.
  const focus = useCallback((width: number, height: number) => ({
    x: (placement.x + placement.w / 2) * width,
    y: placement.y * height + (placement.w * width * aspect) / 2,
  }), [placement, aspect]);

  useLayoutEffect(() => {
    if (!size) return;
    const centre = focus(size.width, size.height);
    geometry.current = { width: size.width, height: size.height, focusX: centre.x, focusY: centre.y, coverTop: cameraCover(size, centre, DROP_ZOOM).top };
  }, [size, focus]);

  // The field reaches past the stage far enough to fill it after the full pan and zoom (the largest reach),
  // and the logo's placement is re-expressed in that bigger canvas so it starts in the same spot on screen.
  const layout = size && (() => {
    const centre = focus(size.width, size.height);
    const cover = cameraCover(size, centre, DROP_ZOOM);
    const width = size.width + cover.left + cover.right, height = size.height + cover.top + cover.bottom;
    // After the pan and drop the logo sits at the stage's centre, scaled by the drop.
    const logoW = placement.w * size.width * DROP_ZOOM, logoH = logoW * aspect;
    return {
      centre,
      logoBox: { x: (size.width - logoW) / 2, y: (size.height - logoH) / 2, w: logoW, h: logoH },
      style: { left: -cover.left, top: -cover.top, width, height, right: "auto", bottom: "auto" } as CSSProperties,
      placement: {
        x: (placement.x * size.width + cover.left) / width,
        y: (placement.y * size.height + cover.top) / height,
        w: (placement.w * size.width) / width,
      },
    };
  })();

  return (
    <div ref={root} className="hero__camera-stage">
      <ScrollCamera className="hero__camera" progress={move} focus={focus} zoom={1} feather={0} enabled>
        <motion.div className="hero__drop" style={{ scale: drop, transformOrigin: layout ? `${layout.centre.x}px ${layout.centre.y}px` : "50% 50%" }}>
          <motion.div className="hero__tiles" style={{ opacity: tiles }} aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <span key={index}>{wordmark}</span>)}
          </motion.div>
          {layout && renderSculpture(layout.placement, { style: layout.style, turn: pan, warp, edge })}
        </motion.div>
        <motion.div className="hero__scrim" style={{ opacity: scrim }} aria-hidden="true" />
        {renderCopy(move)}
      </ScrollCamera>
      {renderTransition(close, layout ? layout.logoBox : null, logoMotion)}
    </div>
  );
}
