import { useEffect, useRef, type ReactNode } from "react";
import { cubicBezier, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { readEasing } from "../../lib/motion/read-motion-token";

type Point = { x: number; y: number };

type ScrollCameraProps = {
  children: ReactNode;
  /** 0..1 through the pinned scroll (lib/scroll/use-pin-progress). */
  progress: MotionValue<number>;
  /** The point to bring to the centre, in px inside this element, given its size (re-read on resize). */
  focus: (width: number, height: number) => Point;
  /** Scale at the end of the pull-back. */
  zoom: number;
  /** Share of the glide toward the centre this layer makes (1 = all the way). Far layers travel less: parallax. */
  travel?: number;
  /** How far the edges feather in by the end, as a share of the size, so the shrunken layer melts into the page. */
  feather: number;
  className?: string;
  enabled: boolean;
};

/**
 * A camera pulling back as the page scrolls: the layer shrinks to `zoom` about `focus` while `focus` glides
 * `travel` of the way to the centre (stack several at different depths for parallax), eased with the --ease-in-out token, and its edges feather in so no hard rectangle shows.
 * Uses motion's useTransform on the scroll value; nothing re-renders per frame.
 */
export function ScrollCamera({ children, progress, focus, zoom, travel = 1, feather, className, enabled }: ScrollCameraProps) {
  const ref = useRef<HTMLDivElement>(null);
  const focusX = useMotionValue(0), focusY = useMotionValue(0);
  const centreX = useMotionValue(0), centreY = useMotionValue(0);
  const eased = useTransform(progress, [0, 1], [0, 1], { ease: cubicBezier(...readEasing("in-out")) });
  const x = useTransform(() => eased.get() * travel * (centreX.get() - focusX.get()));
  const y = useTransform(() => eased.get() * travel * (centreY.get() - focusY.get()));
  const scale = useTransform(eased, [0, 1], [1, zoom]);
  const transformOrigin = useTransform(() => `${focusX.get()}px ${focusY.get()}px`);
  const maskImage = useTransform(eased, (value) => {
    // No feather, no mask: a mask also hides anything drawn outside this element's box (e.g. an oversized layer).
    if (value <= 0 || feather <= 0) return "none";
    const edge = (value * feather * 100).toFixed(2);
    const fade = (to: string) => `linear-gradient(to ${to}, transparent, #000 ${edge}%, #000 calc(100% - ${edge}%), transparent)`;
    return `${fade("right")}, ${fade("bottom")}`;
  });

  // The focus and centre follow the element's size, so the logo still lands centred after a resize.
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const measure = () => {
      const { offsetWidth: width, offsetHeight: height } = element;
      const point = focus(width, height);
      focusX.set(point.x); focusY.set(point.y);
      centreX.set(width / 2); centreY.set(height / 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, focus, focusX, focusY, centreX, centreY]);

  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ x, y, scale, transformOrigin, maskImage, WebkitMaskImage: maskImage, maskComposite: "intersect", WebkitMaskComposite: "source-in" }}>
      {children}
    </motion.div>
  );
}
