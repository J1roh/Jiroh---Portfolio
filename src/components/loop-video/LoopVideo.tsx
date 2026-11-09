import { useEffect, useRef, useState } from "react";
import "./loop-video.css";

type LoopVideoProps = {
  src: string;
  poster: string;
  label: string;
  labels: { pause: string; play: string };
  /** Off: the poster only, never plays (reduced motion, ?fx=none). */
  enabled: boolean;
  className?: string;
};

/** A short muted loop that plays only while on screen and not paused; the visitor can pause it. */
export function LoopVideo({ src, poster, label, labels, enabled, className = "" }: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [seen, setSeen] = useState(false);
  const [held, setHeld] = useState(false);
  const running = enabled && seen && !held;

  useEffect(() => {
    const video = ref.current;
    if (!video || !enabled) return;
    const io = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting));
    io.observe(video);
    return () => io.disconnect();
  }, [enabled]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (running) video.play().catch(() => setHeld(true));
    else video.pause();
  }, [running]);

  return (
    <figure className={`loop-video frame ${className}`}>
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} />
      {enabled && (
        <button type="button" className="loop-video__toggle" onClick={() => setHeld(!held)}>
          {held ? labels.play : labels.pause}
        </button>
      )}
    </figure>
  );
}
