import type { ReactNode } from "react";
import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";
import { readEasing } from "../../lib/motion/read-motion-token";

type ScrollSlideProps = {
  children: ReactNode;
  /** 0..1 through the pinned scroll (lib/scroll/use-pin-progress). */
  progress: MotionValue<number>;
  /** How far it travels sideways by `until`, in viewport widths (negative is left). */
  distanceVw: number;
  /** The progress at which it has fully slid away. */
  until: number;
  className?: string;
  enabled: boolean;
};

/** Content slides sideways out of frame as the page scrolls, eased with the --ease-in-out token. */
export function ScrollSlide({ children, progress, distanceVw, until, className, enabled }: ScrollSlideProps) {
  const x = useTransform(progress, [0, until], ["0vw", `${distanceVw}vw`], { ease: cubicBezier(...readEasing("in-out")) });
  if (!enabled) return <div className={className}>{children}</div>;
  return <motion.div className={className} style={{ x }}>{children}</motion.div>;
}
