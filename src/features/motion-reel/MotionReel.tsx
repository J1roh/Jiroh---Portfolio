import type { MotionContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import { LoopVideo } from "../../components/loop-video";
import "./motion-reel.css";

/** The lead clip across the full width, two more beneath at 7 and 5 columns. */
export function MotionReel({ content, play }: { content: MotionContent; play: boolean }) {
  const labels = { pause: content.pause, play: content.play };
  return (
    <section id="motion" className="section section--l motion-reel" aria-labelledby="motion-title">
      <div className="container">
        <SectionHead id="motion-title" content={content} className="motion-reel__head" />
        <div className="grid-12 motion-reel__grid">
          {content.items.map((item, i) => (
            <div key={item.title} className={`motion-reel__item motion-reel__item--${i}`}>
              <LoopVideo src={item.video} poster={item.poster} label={item.label} labels={labels} enabled={play} />
              <p className="caption"><strong>{item.title}</strong></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
