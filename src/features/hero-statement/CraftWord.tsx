import { useEffect } from "react";
import { animate, useMotionValue } from "motion/react";
import { ScrollScramble } from "../../animations/scroll-scramble";
import { readDuration } from "../../lib/motion/read-motion-token";

type CraftWordProps = { word: string; glyphs: string; enabled: boolean };

/** The h1's changing word: each new word scrambles in left to right (scroll-scramble, driven by time instead of scroll). */
export function CraftWord({ word, glyphs, enabled }: CraftWordProps) {
  const progress = useMotionValue(1);

  useEffect(() => {
    if (!enabled) return;
    progress.set(0);
    const run = animate(progress, 1, { duration: readDuration("reveal"), ease: "linear" });
    return () => run.stop();
  }, [word, enabled, progress]);

  return (
    <ScrollScramble
      text={word} progress={progress} from={0} to={1} glyphs={glyphs}
      className="statement__word" enabled={enabled}
    />
  );
}
