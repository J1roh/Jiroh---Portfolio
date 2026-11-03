import { createLookAt } from "./look-at";
import { createSpinBody } from "./spin-body";

/**
 * How the logo moves. For now (owner, 2026-10-31): "still", the flat logo, which nothing turns.
 * "turn" is the 360° turntable, "look" turns partway toward the pointer, "flick" is the zero-gravity spin with homing.
 */
const LOGO_MOTION = "still" as "still" | "look" | "flick" | "turn";
/** Only "look" and "flick" use the pointer; with "turn" or "still" no pointer listener is attached for the logo. */
export const MOTION_FOLLOWS_POINTER = LOGO_MOTION === "look" || LOGO_MOTION === "flick";
/** "turn": one full turn every this many seconds, its axis tipped this far toward the viewer (0 is upright). */
const AUTO_TURN_S = 12;
const AUTO_TILT_RAD = 0.21;

/** What the sculpture asks of any logo motion: pointer in, orientation out. */
export type LogoMotion = {
  /** Pointer offset from the logo centre in logo widths, or null when it leaves. */
  aim: (u: number | null, v?: number) => void;
  /** Pointer moved (dx, dy) cells in dt seconds over the logo. */
  push: (dx: number, dy: number, dt: number) => void;
  step: (dt: number) => void;
  /** At rest and flat: the overlay can go. */
  settled: () => boolean;
  /** Changing this frame: keep painting every frame. */
  moving: () => boolean;
  /** Row-major rotation from the logo's own axes to the screen's. */
  read: () => Float64Array;
};

const REST = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
/** Never leaves rest and ignores the pointer: the cached flat logo is all that is drawn. */
const still: LogoMotion = { aim: () => {}, push: () => {}, step: () => {}, settled: () => true, moving: () => false, read: () => REST };

/** Not live (reduced motion, effect off) or "still": the flat logo. */
export function createLogoMotion(live: boolean): LogoMotion {
  if (!live || LOGO_MOTION === "still") return still;
  if (LOGO_MOTION === "look") return createLookAt();
  return createSpinBody({ turnS: LOGO_MOTION === "turn" ? AUTO_TURN_S : 0, tiltRad: AUTO_TILT_RAD });
}
