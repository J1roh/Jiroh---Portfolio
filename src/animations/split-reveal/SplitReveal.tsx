import { useEffect, useRef, type ElementType } from "react";
import { animate, stagger } from "motion";
import { readDuration, readEasing } from "../../lib/motion/read-motion-token";
import "./split-reveal.css";

type SplitRevealProps = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Seconds before the first letter moves. */
  delay?: number;
  /** Off: plain text, no motion. */
  enabled: boolean;
};

/**
 * Letters rise out of a clipped line one after another (after alche.studio's split titles).
 * Screen readers get the whole string; the letter spans are hidden from them.
 */
export function SplitReveal({ text, as: Tag = "span", className, delay = 0, enabled }: SplitRevealProps) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const letters = root.current?.querySelectorAll<HTMLElement>(".split-reveal__char");
    if (!enabled || !letters?.length) return;
    const controls = animate(
      letters,
      { y: ["110%", "0%"], opacity: [0, 1] },
      { duration: readDuration("reveal"), ease: readEasing("out"), delay: stagger(readDuration("stagger"), { startDelay: delay }) },
    );
    return () => controls.stop();
  }, [enabled, delay, text]);

  if (!enabled) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag ref={root} className={className} aria-label={text}>
      {text.split(" ").map((word, wordIndex) => (
        <span className="split-reveal__word" aria-hidden="true" key={`${word}-${wordIndex}`}>
          {[...word].map((char, charIndex) => (
            <span className="split-reveal__char" key={charIndex}>{char}</span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
