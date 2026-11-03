import { smoothstep } from "../../lib/math/math";
import { fromRotationVector, identity, multiply, normalise, slerp, toMatrix, toRotationVector, type Quat } from "../../lib/math/quaternion";

/**
 * The logo as a rigid body floating in zero gravity (after alche.studio): an orientation quaternion
 * and an angular velocity. The pointer grips its surface and sets it spinning; it coasts on its own
 * momentum with little friction, then a critically damped homing torque brings it back to face front.
 * What is drawn trails that body slightly (soft follow), so flicks ease in rather than jump.
 * Hand-rolled: motion.dev's `inertia` and `spring` are 1D keyframe generators and can't hold a 3D spin.
 */
/** Pointer travel (in cells) that turns the logo one radian: the trackball's radius. */
const TRACKBALL_CELLS = 28;
/** How much of the hand's speed the logo takes per pointer sample (0 slips, 1 sticks). */
const GRIP = 0.4;
/** Fastest spin, rad/s (about 0.9 turns a second), so a hard flick stays readable. */
const MAX_SPIN = 6;
/** Friction: spin falls to 1/e in this many seconds, so it floats rather than stops. */
const SPIN_TAU = 1.8;
/** After the last touch it drifts freely this long, then homing fades in over HOME_FADE_S. */
const HOLD_S = 1.4;
const HOME_FADE_S = 0.6;
/** Homing spring's natural frequency, rad/s; critically damped, so home in about 1.5 s with no wobble. */
const HOME_RATE = 3;
/** Soft follow: the shown turn closes 1 − e^(−rate·dt) of its gap to the body each frame (about 110 ms lag). */
const FOLLOW_RATE = 9;
const REST_ANGLE = 0.002;
const REST_SPEED = 0.005;
/** Shortest pointer interval used for speed, so two events in one frame don't read as a huge flick. */
const MIN_SAMPLE_S = 1 / 120;

/**
 * With `turnS`, the logo instead turns a full 360° about its upright axis every `turnS` seconds,
 * on its own and forever (it never settles); pushes are ignored. `tiltRad` tips that axis toward
 * the viewer, like a turntable seen a little from above, so the top walls show.
 */
export function createSpinBody({ turnS = 0, tiltRad = 0 } = {}) {
  const tilt = fromRotationVector(tiltRad, 0, 0);
  let turn = 0;
  let q: Quat = identity();
  let shown: Quat = identity();
  const spin = [0, 0, 0];
  const matrix = toMatrix(q, new Float64Array(9));
  let idle = 0;
  let settled = turnS <= 0;

  return {
    /**
     * The pointer moved (dx, dy) cells in `dt` seconds over the logo. Screen axes: x right, y down,
     * z into the screen. Moving right swings the front face right (about −y), moving down tips it down (about +x).
     */
    push: (dx: number, dy: number, dt: number) => {
      if (turnS > 0) return;
      const rate = 1 / (Math.max(dt, MIN_SAMPLE_S) * TRACKBALL_CELLS);
      spin[0] += (dy * rate - spin[0]) * GRIP;
      spin[1] += (-dx * rate - spin[1]) * GRIP;
      const speed = Math.hypot(spin[0], spin[1], spin[2]);
      if (speed > MAX_SPIN) for (let i = 0; i < 3; i++) spin[i] *= MAX_SPIN / speed;
      idle = 0;
      settled = false;
    },
    step: (dt: number) => {
      if (settled) return;
      if (turnS > 0) {
        // Front face swings right, like a flick to the right; built from the angle so rounding never builds up.
        turn = (turn + (2 * Math.PI * dt) / turnS) % (2 * Math.PI);
        q = multiply(tilt, fromRotationVector(0, -turn, 0));
        toMatrix(q, matrix);
        return;
      }
      idle += dt;
      const home = smoothstep(HOLD_S, HOLD_S + HOME_FADE_S, idle);
      const error = toRotationVector(q);
      const friction = Math.exp(-dt / SPIN_TAU);
      for (let i = 0; i < 3; i++) {
        const torque = -HOME_RATE * HOME_RATE * error[i] - 2 * HOME_RATE * spin[i];
        spin[i] = spin[i] * friction + home * torque * dt;
      }
      // Spin is in screen axes, so it multiplies on the left.
      q = normalise(multiply(fromRotationVector(spin[0] * dt, spin[1] * dt, spin[2] * dt), q));
      shown = slerp(shown, q, 1 - Math.exp(-FOLLOW_RATE * dt));
      const angle = Math.hypot(...toRotationVector(q));
      const lag = Math.hypot(...toRotationVector(multiply(shown, [-q[0], -q[1], -q[2], q[3]])));
      settled = home === 1 && angle < REST_ANGLE && lag < REST_ANGLE && Math.hypot(spin[0], spin[1], spin[2]) < REST_SPEED;
      if (settled) { q = identity(); shown = identity(); spin.fill(0); }
      toMatrix(shown, matrix);
    },
    settled: () => settled,
    moving: () => !settled,
    /** Pointer position isn't used: this body is driven by pushes or turns on its own. */
    aim: () => {},
    /** Row-major rotation from the logo's own axes to the screen's, as shown (eased after the body). */
    read: () => matrix,
  };
}

export type SpinBody = ReturnType<typeof createSpinBody>;
