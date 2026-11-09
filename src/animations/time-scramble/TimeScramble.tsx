import { useEffect } from "react";
import { animate, useMotionValue } from "motion/react";
import { ScrollScramble } from "../scroll-scramble";
import { readDuration } from "../../lib/motion/read-motion-token";

type TimeScrambleProps = {
  text: string;
  glyphs: string;
  /** Replays the scramble whenever it changes (a new word, a new hover). */
  play: unknown;
  className?: string;
  enabled: boolean;
};

/** Text that scrambles in left to right over `--motion-reveal` each time `play` changes: scroll-scramble driven by time. */
export function TimeScramble({ text, glyphs, play, className, enabled }: TimeScrambleProps) {
  const progress = useMotionValue(1);

  useEffect(() => {
    if (!enabled) return;
    progress.set(0);
    const run = animate(progress, 1, { duration: readDuration("reveal"), ease: "linear" });
    return () => run.stop();
  }, [text, play, enabled, progress]);

  return (
    <ScrollScramble text={text} progress={progress} from={0} to={1} glyphs={glyphs} className={className} enabled={enabled} />
  );
}
