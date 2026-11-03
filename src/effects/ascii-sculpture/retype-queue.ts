/**
 * Phrase swaps (service rail hover) rebuild the whole field, so they are coalesced: a swap waits for
 * the pointer to settle on a card, at most one runs per cooldown, and only the latest phrase is applied.
 */
const RETYPE_INTENT_MS = 140;
const RETYPE_COOLDOWN_MS = 700;

export function createRetypeQueue(apply: (phrase: string) => void) {
  let wanted: string | null = null;
  let timer = 0;
  let last = -Infinity;

  const flush = () => {
    timer = 0;
    if (wanted === null) return;
    last = performance.now();
    apply(wanted);
    wanted = null;
  };

  return {
    request: (phrase: string) => {
      wanted = phrase;
      if (!timer) timer = window.setTimeout(flush, Math.max(RETYPE_INTENT_MS, last + RETYPE_COOLDOWN_MS - performance.now()));
    },
    cancel: () => window.clearTimeout(timer),
  };
}
