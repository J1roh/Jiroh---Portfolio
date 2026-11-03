import { useLayoutEffect, useState, type RefObject } from "react";

export type ElementSize = { width: number; height: number };

/**
 * An element's layout size in css px (transforms ignored), or null until it is measured.
 * Measured before first paint, then kept current with a ResizeObserver.
 */
export function useElementSize(target: RefObject<HTMLElement | null>, enabled = true) {
  const [size, setSize] = useState<ElementSize | null>(null);

  useLayoutEffect(() => {
    const element = target.current;
    if (!element || !enabled) return;
    const measure = () => setSize((last) => {
      const { offsetWidth: width, offsetHeight: height } = element;
      return last && last.width === width && last.height === height ? last : { width, height };
    });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [target, enabled]);

  return enabled ? size : null;
}
