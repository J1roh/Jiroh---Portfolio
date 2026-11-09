import { useCallback, useEffect, useState } from "react";

/**
 * The active craft: moves to the next one every `everyMs` while `running`.
 * `pick` jumps to a craft and restarts the wait; `tick` changes on every move, to restart timers drawn in CSS.
 */
export function useCraftCycle(count: number, everyMs: number, running: boolean) {
  const [state, setState] = useState({ index: 0, tick: 0 });

  useEffect(() => {
    if (!running || count < 2) return;
    const id = window.setTimeout(
      () => setState((s) => ({ index: (s.index + 1) % count, tick: s.tick + 1 })),
      everyMs,
    );
    return () => window.clearTimeout(id);
  }, [state, running, count, everyMs]);

  const pick = useCallback((index: number) => setState((s) => ({ index, tick: s.tick + 1 })), []);
  return { index: state.index, tick: state.tick, pick };
}
