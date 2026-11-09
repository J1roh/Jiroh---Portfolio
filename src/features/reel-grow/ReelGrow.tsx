import { useRef, useState, type CSSProperties } from "react";
import { motion, useTransform } from "motion/react";
import type { ReelContent } from "@content/index";
import { usePinProgress } from "../../lib/scroll/use-pin-progress";
import { ReelStage } from "./ReelStage";
import "./reel-grow.css";

type ReelGrowProps = { content: ReelContent; pinned: boolean };

/**
 * The showreel (Figma "Reel grow"): the centre reel with the previous and next peeking at the edges, a counter and
 * arrows. Pinned on wide screens: one screen of scroll grows the centre to full-bleed as the side reels slide out.
 */
export function ReelGrow({ content, pinned }: ReelGrowProps) {
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const progress = usePinProgress(ref);
  const grow = useTransform(progress, [0.1, 0.75], [0, 1], { clamp: true });
  const n = content.items.length;
  const at = (offset: number) => content.items[(index + offset + n) % n];
  const step = (by: number) => setIndex((i) => (i + by + n) % n);

  return (
    <section ref={ref} id="reel" className="reel" data-pinned={pinned} aria-label={content.head}>
      <motion.div className="reel__stage" style={{ "--grow": pinned ? grow : 0 } as unknown as CSSProperties}>
        <ReelStage key={index} content={content} prev={at(-1)} reel={at(0)} next={at(1)} />
        <div className="container reel__bar">
          <p className="reel__count">{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</p>
          <p className="reel__title">{at(0).title} · {content.nextLabel}: {at(1).title}</p>
          <div className="reel__arrows">
            <button type="button" className="reel__arrow" aria-label={content.prev} onClick={() => step(-1)}>←</button>
            <button type="button" className="reel__arrow" aria-label={content.next} onClick={() => step(1)}>→</button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
