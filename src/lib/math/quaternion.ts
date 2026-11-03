/** Unit quaternion as [x, y, z, w]; rotation vectors are axis × angle in radians. */
export type Quat = [number, number, number, number];
export type Vec3 = [number, number, number];

export const identity = (): Quat => [0, 0, 0, 1];

/** a ⊗ b: rotate by b, then by a. */
export function multiply(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

export function normalise(q: Quat): Quat {
  const length = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / length, q[1] / length, q[2] / length, q[3] / length];
}

/** From `a` toward `b` by `t` along the shorter arc. */
export function slerp(a: Quat, b: Quat, t: number): Quat {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const sign = dot < 0 ? -1 : 1;
  dot *= sign;
  // Nearly the same turn: a normalised lerp is exact enough and avoids dividing by sin(0).
  if (dot > 0.9995) return normalise(a.map((value, i) => value + (b[i] * sign - value) * t) as Quat);
  const angle = Math.acos(dot);
  const wa = Math.sin((1 - t) * angle) / Math.sin(angle);
  const wb = (Math.sin(t * angle) / Math.sin(angle)) * sign;
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb, a[3] * wa + b[3] * wb];
}

/** exp: the turn of `angle = |v|` about `v`. */
export function fromRotationVector(x: number, y: number, z: number): Quat {
  const angle = Math.hypot(x, y, z);
  if (angle < 1e-9) return [x / 2, y / 2, z / 2, 1];
  const s = Math.sin(angle / 2) / angle;
  return [x * s, y * s, z * s, Math.cos(angle / 2)];
}

/** log: `q` as the shortest equivalent turn (angle in [0, π]), as a rotation vector. */
export function toRotationVector(q: Quat): Vec3 {
  const sign = q[3] < 0 ? -1 : 1;
  const [x, y, z, w] = [q[0] * sign, q[1] * sign, q[2] * sign, q[3] * sign];
  const s = Math.hypot(x, y, z);
  if (s < 1e-9) return [2 * x, 2 * y, 2 * z];
  const k = (2 * Math.atan2(s, w)) / s;
  return [x * k, y * k, z * k];
}

/** Row-major 3×3 rotation matrix, written into `out`. */
export function toMatrix(q: Quat, out: Float64Array) {
  const [x, y, z, w] = q;
  out[0] = 1 - 2 * (y * y + z * z); out[1] = 2 * (x * y - z * w); out[2] = 2 * (x * z + y * w);
  out[3] = 2 * (x * y + z * w); out[4] = 1 - 2 * (x * x + z * z); out[5] = 2 * (y * z - x * w);
  out[6] = 2 * (x * z - y * w); out[7] = 2 * (y * z + x * w); out[8] = 1 - 2 * (x * x + y * y);
  return out;
}
