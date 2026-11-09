import { useRef, useState } from "react";
import type { Reel, ReelContent } from "@content/index";

type ReelStageProps = { content: ReelContent; prev: Reel; reel: Reel; next: Reel };

/** The centre reel and its two neighbours. "Play showreel" swaps the poster for the clip with native controls. */
export function ReelStage({ content, prev, reel, next }: ReelStageProps) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const side = (r: Reel, edge: "prev" | "next") => (
    <img className={`reel__side reel__side--${edge}`} src={r.image.src} alt="" loading="lazy" decoding="async" />
  );

  return (
    <div className="reel__row">
      {side(prev, "prev")}
      <figure className="reel__centre">
        {playing && reel.video ? (
          <video ref={video} className="reel__media" src={reel.video} poster={reel.image.src} controls autoPlay playsInline />
        ) : (
          <img className="reel__media" src={reel.image.src} alt={reel.image.label} loading="lazy" decoding="async" />
        )}
        {reel.video && !playing && (
          <button type="button" className="reel__play" onClick={() => setPlaying(true)}>
            {content.play}<span className="reel__play-chip" aria-hidden="true">↗</span>
          </button>
        )}
      </figure>
      {side(next, "next")}
    </div>
  );
}
