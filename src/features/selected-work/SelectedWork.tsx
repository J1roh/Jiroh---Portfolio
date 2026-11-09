import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "motion/react";
import type { WorkContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import { usePinProgress } from "../../lib/scroll/use-pin-progress";
import { useElementSize } from "../../lib/viewport/use-element-size";
import { WorkCards } from "./WorkCards";
import "./selected-work.css";

type SelectedWorkProps = { content: WorkContent; pinned: boolean };

/**
 * Selected work (Figma "Selected work (horizontal track, pins on scroll)"): the section pins and vertical scroll
 * moves six big cards sideways; progress line and counter follow; craft chips jump to the first matching card.
 * Unpinned (narrow, reduced motion, ?fx=-camera): a native sideways scroller with snap.
 */
export function SelectedWork({ content, pinned }: SelectedWorkProps) {
  const ref = useRef<HTMLElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const viewSize = useElementSize(view, pinned);
  const trackSize = useElementSize(track, pinned);
  const [craft, setCraft] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const n = content.items.length;
  const progress = usePinProgress(ref);
  const travel = Math.max(0, (trackSize?.width ?? 0) - (viewSize?.width ?? 0));
  const x = useTransform(progress, (p) => -p * travel);
  useMotionValueEvent(progress, "change", (p) => { if (pinned) setActive(Math.round(p * (n - 1))); });

  const jump = (next: string | null) => {
    setCraft(next);
    const i = next ? content.items.findIndex((c) => c.craft === next) : 0;
    const section = ref.current;
    if (i < 0 || !section) return;
    setActive(i);
    if (pinned) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (i / (n - 1)) * (section.offsetHeight - window.innerHeight) });
    } else {
      track.current?.children[i]?.scrollIntoView({ inline: "start", block: "nearest" });
    }
  };

  return (
    <section ref={ref} id="work" className="work" data-pinned={pinned} aria-labelledby="work-title">
      <div className="work__stage">
        <div className="container work__head">
          <SectionHead id="work-title" content={content} size="display" />
          <ul className="work__chips" aria-label={content.filtersLabel}>
            {[null, ...content.crafts].map((c) => (
              <li key={c ?? "all"}>
                <button type="button" className="chip" aria-pressed={craft === c} onClick={() => jump(c)}>
                  {c ?? content.all}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="container">
          <div ref={view} className="work__view">
            <motion.div className="work__mover" style={pinned ? { x } : undefined}>
              <WorkCards ref={track} items={content.items} craft={craft} />
            </motion.div>
          </div>
        </div>
        <div className="container work__foot">
          <span className="work__progress">
            <span className="work__fill" style={{ transform: `scaleX(${(active + 1) / n})` }} />
          </span>
          <span className="work__count">{String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          <a className="work__all" href={content.allWork.href}>{content.allWork.label} ↗</a>
        </div>
      </div>
    </section>
  );
}
