import { fromRotationVector, multiply, toMatrix } from "../../lib/math/quaternion";

/**
 * The logo turns partway toward the pointer and follows it, like a character in a game's
 * character-select viewport: never facing it fully, never spinning, and easing back to front when
 * the pointer leaves. Each angle follows its target with a critically damped spring (the SmoothDamp
 * games use), so it eases in and out with no jolt when the pointer jumps and no overshoot.
 * Hand-rolled: motion.dev's eases are 1D curves over a fixed time, and this follows a moving target.
 */
/** Furthest it can turn sideways and up or down, rad (about 57° and 37°); tanh keeps it from reaching that. */
const MAX_YAW = 1;
const MAX_PITCH = 0.65;
/** Pointer offset, in logo widths, that gets about 76% of the maximum (tanh(1)). From the far left of the page, about 45°. */
const REACH = 1.6;
/** Roughly how long the follow takes to close most of the gap, s. Lower is snappier. */
const SMOOTH_S = 0.3;
const REST_ANGLE = 0.002;
const REST_SPEED = 0.01;

export function createLookAt() {
  const angle = { yaw: 0, pitch: 0 };
  const speed = { yaw: 0, pitch: 0 };
  const target = { yaw: 0, pitch: 0 };
  const matrix = toMatrix([0, 0, 0, 1], new Float64Array(9));
  let home = true;
  let settled = true;
  let moving = false;

  return {
    /** Pointer offset from the logo centre in logo widths (x right, y down), or null to face front. */
    aim: (u: number | null, v = 0) => {
      home = u === null;
      target.yaw = home ? 0 : MAX_YAW * Math.tanh((u ?? 0) / REACH);
      target.pitch = home ? 0 : MAX_PITCH * Math.tanh(v / REACH);
      if (!home) settled = false;
    },
    step: (dt: number) => {
      if (settled) return;
      for (const axis of ["yaw", "pitch"] as const) [angle[axis], speed[axis]] = smoothDamp(angle[axis], target[axis], speed[axis], dt);
      moving = Math.abs(angle.yaw - target.yaw) + Math.abs(angle.pitch - target.pitch) > REST_ANGLE
        || Math.abs(speed.yaw) + Math.abs(speed.pitch) > REST_SPEED;
      if (home && !moving) { angle.yaw = angle.pitch = speed.yaw = speed.pitch = 0; settled = true; }
      // The front face turns toward the pointer: yaw about −y, then pitch about +x, so it never rolls.
      toMatrix(multiply(fromRotationVector(angle.pitch, 0, 0), fromRotationVector(0, -angle.yaw, 0)), matrix);
    },
    settled: () => settled,
    /** Still easing toward the target; once there, frames can rest while it stays turned. */
    moving: () => moving && !settled,
    /** Row-major rotation from the logo's own axes to the screen's. */
    read: () => matrix,
    push: () => {},
  };
}

/** Critically damped follow, frame-rate independent (Game Programming Gems 4, as in Unity's SmoothDamp). */
function smoothDamp(current: number, target: number, velocity: number, dt: number): [number, number] {
  const omega = 2 / SMOOTH_S;
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const gap = current - target;
  const pull = (velocity + omega * gap) * dt;
  return [target + (gap + pull) * decay, (velocity - omega * pull) * decay];
}
