import type { ReactNode } from "react";
import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";

type ScrollRiseProps = {
  children: ReactNode;
  /** A scroll value; the child rises in as it goes from `from` to `to`. */
  progress: MotionValue<number>;
  from: number;
  to: number;
  /** How far below its place it starts, px. */
  rise?: number;
  className?: string;
  enabled: boolean;
};

/** power3.out, as in the Alche reference. */
const EASE = cubicBezier(0.215, 0.61, 0.355, 1);

/** Content fades and rises into place as the page scrolls through a range; scrolling back reverses it. */
export function ScrollRise({ children, progress, from, to, rise = 24, className, enabled }: ScrollRiseProps) {
  const opacity = useTransform(progress, [from, to], [0, 1], { ease: EASE });
  const y = useTransform(progress, [from, to], [rise, 0], { ease: EASE });
  if (!enabled) return <div className={className}>{children}</div>;
  return <motion.div className={className} style={{ opacity, y }}>{children}</motion.div>;
}
