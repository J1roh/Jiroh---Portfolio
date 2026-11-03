import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import "./magnetic.css";

type MagneticProps = {
  children: ReactNode;
  /** How far toward the pointer the child moves, as a share of the pointer's offset. */
  pull?: number;
  enabled: boolean;
};

const SPRING = { stiffness: 260, damping: 18, mass: 0.6 };

/** The child leans toward the pointer while hovered and springs back on leave. Mouse and pen only. */
export function Magnetic({ children, pull = 0.3, enabled }: MagneticProps) {
  const box = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  if (!enabled) return <>{children}</>;

  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * pull);
    y.set((event.clientY - rect.top - rect.height / 2) * pull);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.span ref={box} className="magnetic" style={{ x, y }} onPointerMove={move} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
}
