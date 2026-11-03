import { useRef, useState, type CSSProperties } from "react";
import { motion, type MotionValue } from "motion/react";
import type { HeroContent, ImageContent } from "@content/index";
import { Button } from "../../components/button";
import { SplitReveal } from "../../animations/split-reveal";
import { ScrollSlide } from "../../animations/scroll-slide";
import { AsciiSculpture } from "../../effects/ascii-sculpture";
import { usePinProgress } from "../../lib/scroll/use-pin-progress";
import { useMediaQuery } from "../../lib/viewport/use-media-query";
import { useTheme } from "../../lib/theme/use-theme";
import { useStepScroll } from "../../lib/scroll/use-step-scroll";
import { HeroCameraStage } from "./HeroCameraStage";
import { HeroTransition } from "./HeroTransition";
import { ServiceRail } from "./ServiceRail";
import "./hero.css";

export type HeroFx = { reveal: boolean; camera: boolean; sculpture: boolean; still: boolean };

type HeroProps = { content: HeroContent; mark: ImageContent; fx: HeroFx };
type Extras = { style?: CSSProperties; turn?: MotionValue<number>; warp?: MotionValue<number>; edge?: MotionValue<number> };

/** Logo at x740 y200, 660 wide in the 1440×900 frame (Figma has y240; owner moved it, 2026-10-31). Narrow screens centre it in its own block. */
const PLACEMENT_WIDE = { x: 740 / 1440, y: 200 / 900, w: 660 / 1440 };
const PLACEMENT_NARROW = { x: 0.06, y: 0.18, w: 0.88 };
/** Off for now (owner, 2026-10-31): the service rail (cards and hint) is hidden; the logo keeps its default phrase. */
const SERVICE_RAIL = false;
const LINE_STAGGER_S = 0.12;
const INTRO_DELAY_S = 0.7;
/** One scroll gesture plays the whole flow, copy out to mask up, either way (owner, 2026-10-31). */
const FLOW_STEP = { from: 0, to: 1, durationS: 1.2 };
/** Off for now (owner, 2026-10-31): no auto glide; scroll scrubs the flow directly. */
const AUTO_GLIDE = false;

/**
 * The first screen: the hook on the left, the logo typed in ASCII across the whole field on the right.
 * On wide screens it pins for a scroll sequence (HeroCameraStage): the copy slides out as the logo pans to the
 * centre, the scene zooms out a little as the logo drops, and the page-load ripple plays out from it. The service rail is hidden for now.
 */
export function Hero({ content, mark, fx }: HeroProps) {
  const section = useRef<HTMLElement>(null);
  const progress = usePinProgress(section);
  const narrow = useMediaQuery("(max-width: 860px)");
  const camera = fx.camera && !fx.still && !narrow;
  const { theme } = useTheme();
  const reveal = fx.reveal && !fx.still;
  useStepScroll(section, progress, { ...FLOW_STEP, enabled: camera && AUTO_GLIDE });
  const live = fx.sculpture && !fx.still;
  const [preview, setPreview] = useState<string | null>(null);
  const previewed = content.services.find((service) => service.index === preview);
  const fade = (delay: number) => ({
    initial: reveal ? { opacity: 0, y: 12 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.6 },
  }) as const;

  const sculpture = (place: typeof PLACEMENT_WIDE, extras: Extras = {}) => (
    <AsciiSculpture
      className="hero__field"
      src={mark.src}
      label={mark.label}
      phrase={previewed?.phrase ?? content.sculpture.phrase}
      cursorLabel={content.sculpture.cursorLabel}
      placement={place}
      enabled={live}
      theme={theme}
      {...extras}
    />
  );
  const copy = (move: MotionValue<number>) => (
    <ScrollSlide className="hero__copy" progress={move} distanceVw={-110} until={1} enabled={camera}>
      <motion.p className="hero__eyebrow" {...fade(0)}>{content.eyebrow}</motion.p>
      <h1 id="hero-title" className="hero__title" aria-label={content.hookLines.join(" ")}>
        {content.hookLines.map((line, index) => (
          <SplitReveal className="hero__line" text={line} delay={index * LINE_STAGGER_S} enabled={reveal} key={line} />
        ))}
      </h1>
      <motion.p className="hero__intro" {...fade(INTRO_DELAY_S)}>{content.intro}</motion.p>
      <motion.div className="hero__actions" {...fade(INTRO_DELAY_S + 0.1)}>
        <Button href={content.primaryCta.href}>{content.primaryCta.label}</Button>
        <Button href={content.secondaryCta.href} variant="text">{content.secondaryCta.label}</Button>
      </motion.div>
    </ScrollSlide>
  );

  return (
    <section ref={section} className={camera ? "hero hero--camera" : "hero"} aria-labelledby="hero-title">
      <div className="hero__stage">
        {camera ? (
          <HeroCameraStage progress={progress} placement={PLACEMENT_WIDE} aspect={mark.aspect} renderSculpture={sculpture} renderCopy={copy} wordmark={content.wordmark}
            renderTransition={(close, logoBox, logoMotion) => (
              <HeroTransition progress={close} logoBox={logoBox} logoMotion={logoMotion} logoSrc={mark.src} content={content.transition} enabled />
            )}
          />
        ) : (
          <div className="hero__camera">
            {sculpture(narrow ? PLACEMENT_NARROW : PLACEMENT_WIDE)}
            <div className="hero__scrim" aria-hidden="true" />
            {copy(progress)}
          </div>
        )}
        {SERVICE_RAIL && <motion.div className="hero__rail-wrap" {...fade(INTRO_DELAY_S + 0.25)}>
          <ServiceRail
            services={content.services}
            hint={live ? content.sculpture.hint : ""}
            active={live ? preview : null}
            onPreview={live ? setPreview : () => {}}
          />
        </motion.div>}
      </div>
    </section>
  );
}
