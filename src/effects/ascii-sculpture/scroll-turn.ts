import { fromRotationVector, multiply, toMatrix } from "../../lib/math/quaternion";

/** At mid-turn the axis tips this far toward the viewer, so the top walls show; flat at both ends. */
const TILT_RAD = 0.21;

/**
 * One full 360° turn of the logo about its upright axis, driven from outside (the hero's scroll): `t` 0..1.
 * The front face swings right, as with the timed "turn" in spin-body.ts. At 0 and 1 the logo is flat, so the
 * cached flat field is drawn.
 */
export function createScrollTurn() {
  const matrix = new Float64Array(9);
  let at = 0;
  return {
    /** Sets the turn; false when unchanged. */
    set: (t: number) => {
      if (t === at) return false;
      at = t;
      const tilt = fromRotationVector(TILT_RAD * Math.sin(Math.PI * t), 0, 0);
      toMatrix(multiply(tilt, fromRotationVector(0, -2 * Math.PI * t, 0)), matrix);
      return true;
    },
    /** Partway round: draw the turned logo. */
    active: () => at > 0 && at < 1,
    /** Row-major rotation from the logo's own axes to the screen's. */
    read: () => matrix,
  };
}
