import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";
import type { HeroContent } from "@content/index";
import { SCRAMBLE_GLYPHS } from "../../effects/ascii-sculpture";
import { GridMask } from "../../effects/grid-mask";
import { LogoOutline } from "../../effects/logo-outline";
import { ScrollRise } from "../../animations/scroll-rise";
import { ScrollScramble } from "../../animations/scroll-scramble";
import "./hero-transition.css";

type Box = { x: number; y: number; w: number; h: number };

type HeroTransitionProps = {
  /** 0..1 through this closing phase of the pinned scroll. */
  progress: MotionValue<number>;
  /** The ASCII logo's final box on screen, px, so the line art lands exactly on it. */
  logoBox: Box | null;
  /** Offset and scale from that final box to where the logo is now, while it still pans and drops. */
  logoMotion: { x: MotionValue<number>; y: MotionValue<number>; scale: MotionValue<number> };
  /** Logo image to trace. */
  logoSrc: string;
  content: HeroContent["transition"];
  enabled: boolean;
};

/**
 * Phase timing (Figma Reference "Transition - Alche", rescaled to this phase): the mask's flat top edge peeks in from
 * the bottom, then rises fast to cover the frame; where it covers the ASCII logo the logo reads as line art. The copy
 * (owner, 2026-11-03: kept from the Glyph tide) comes in after.
 */
const PEEK_END = 0.12;
/** The peek shows this share of the frame (about 7vh). */
const PEEK = 0.07;
const RISE_END = 0.8;
/** easeInOutCubic. */
const RISE_EASE = cubicBezier(0.65, 0, 0.35, 1);
/** The eyebrow rises in, then the heading types itself in, then the body rises in. */
const EYEBROW: [number, number] = [0.45, 0.55];
const HEADING: [number, number] = [0.46, 0.86];
const BODY: [number, number] = [0.79, 0.93];
/** Line-art logo stroke, css px (owner, 2026-10-31: thinner than the 2 px default). */
const OUTLINE_STROKE = 1.25;

/** How much of the frame the mask covers (0..1) at `t` through this phase: a peek, then the fast rise. */
export function maskCover(t: number) {
  if (t <= PEEK_END) return (Math.max(0, t) / PEEK_END) * PEEK;
  return PEEK + (1 - PEEK) * RISE_EASE(Math.min(1, (t - PEEK_END) / (RISE_END - PEEK_END)));
}

/** The hero's closing transition: a grid mask rises over the field, turning the ASCII logo into line art; copy types in on it. */
export function HeroTransition({ progress, logoBox, logoMotion, logoSrc, content, enabled }: HeroTransitionProps) {
  const cover = useTransform(progress, maskCover);
  // Each line gets its share of the heading's range, by length, so the typing keeps one pace across lines.
  const total = content.lines.reduce((sum, line) => sum + line.length, 0);
  const share = (chars: number) => HEADING[0] + ((HEADING[1] - HEADING[0]) * chars) / total;
  const lines = content.lines.map((line, index) => {
    const before = content.lines.slice(0, index).reduce((sum, previous) => sum + previous.length, 0);
    return { line, from: share(before), to: share(before + line.length) };
  });

  return (
    <GridMask className="hero__mask" rise={cover} enabled={enabled}>
      {logoBox && (
        <motion.div
          className="hero__mask-logo-track"
          style={{ ...logoMotion, transformOrigin: `${logoBox.x + logoBox.w / 2}px ${logoBox.y + logoBox.h / 2}px` }}
        >
          <LogoOutline className="hero__mask-logo" src={logoSrc} box={logoBox} stroke={OUTLINE_STROKE} />
        </motion.div>
      )}
      <div className="hero__mask-copy">
        <ScrollRise progress={progress} from={EYEBROW[0]} to={EYEBROW[1]} enabled={enabled}>
          <p className="hero__mask-eyebrow">{content.eyebrow}</p>
        </ScrollRise>
        <div className="hero__mask-title" role="heading" aria-level={2}>
          {lines.map(({ line, from, to }) => (
            <ScrollRise className="hero__mask-line" progress={progress} from={from} to={from + (to - from) * 0.2} rise={0} enabled={enabled} key={line}>
              <ScrollScramble className="hero__mask-box" text={line} progress={progress} from={from} to={to} glyphs={SCRAMBLE_GLYPHS} enabled={enabled} />
            </ScrollRise>
          ))}
        </div>
        <ScrollRise progress={progress} from={BODY[0]} to={BODY[1]} enabled={enabled}>
          <p className="hero__mask-body">{content.body}</p>
        </ScrollRise>
      </div>
    </GridMask>
  );
}
