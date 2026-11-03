import type { Layout } from "./paint-base";
import type { Volume } from "./logo-volume";
import type { Wake } from "./waves";
import { MOTION_FOLLOWS_POINTER, type LogoMotion } from "./logo-motion";
import { createPointerInput } from "./pointer-input";

/** Off for now (owner): a click no longer sends the full-field ripple. Entrance and retype ripples stay. */
const CLICK_RIPPLE = false;
/** Off for now (owner, 2026-10-31): the pointer leaves no water trail. */
const POINTER_WAKE = false;

type PointerOptions = {
  layout: Layout;
  motion: LogoMotion;
  wakes: Wake[];
  /** The logo solid, once built. */
  volume: () => Volume | null;
  now: () => number;
  wake: () => void;
  /** Sends a ripple from (x, y) in cells. */
  ripple: (x: number, y: number) => void;
  live: boolean;
};

type At = { x: number; y: number };

/** The sculpture's pointer API (canvas px in), routed to the logo motion, wakes and the click ripple. */
export function sculpturePointer({ layout, motion, wakes, volume, now, wake, ripple, live }: PointerOptions) {
  const input = createPointerInput({ layout, motion, wakes, bounds: () => volume()?.bounds ?? null, now, wake });
  return {
    /** Whether the logo's motion uses the pointer at all; if not, callers attach no pointer listeners for it. */
    followsPointer: live && MOTION_FOLLOWS_POINTER,
    /** Pointer moved over the canvas: over the logo, it flicks the spin (in "flick" motion only). */
    hover: input.hover,
    /** Pointer anywhere on the page, or null when it leaves: the logo turns partway toward it. */
    look: (at: At | null) => {
      const v = volume();
      if (v) motion.aim(at && (at.x - v.cx) / v.w, at ? (at.y - v.cy) / v.w : 0);
    },
    /** Pointer moved over the field: leaves a trail of water rings. */
    drag: (at: At) => { if (POINTER_WAKE) input.drag(at); },
    release: input.release,
    click: (at: At) => { if (CLICK_RIPPLE) ripple(at.x / layout.w, at.y / layout.h); },
  };
}
