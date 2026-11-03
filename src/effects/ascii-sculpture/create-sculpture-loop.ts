import { cancelFrame, frame } from "motion";

type LoopOptions = {
  /** Paint one frame at `time` seconds. */
  draw: (time: number, live: boolean) => void;
  /** Animated (twinkle, hover, ripples) or a single still paint. */
  live: boolean;
};

/**
 * Drives the sculpture on motion's frame loop: runs only while on screen and animated,
 * otherwise paints on demand.
 */
export function createSculptureLoop({ draw, live }: LoopOptions) {
  let time = 0;
  let visible = false;
  let running = false;

  const tick = ({ delta }: { delta: number }) => {
    const dt = Math.min(delta / 1000, 0.1);
    time += dt;
    draw(time, true);
  };
  const start = () => {
    if (running || !live || !visible) return;
    running = true;
    frame.update(tick, true);
  };
  const stop = () => {
    running = false;
    cancelFrame(tick);
  };

  return {
    now: () => time,
    stop,
    wake: start,
    /** Repaint now, e.g. after a resize; also the only paint when not live. */
    redraw: () => draw(time, live),
    setVisible: (on: boolean) => {
      visible = on;
      if (on) start();
      else stop();
    },
  };
}
