export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Frame-rate independent easing toward a target; `lambda` is how fast it closes the gap. */
export const damp = (from: number, to: number, lambda: number, dtSeconds: number) =>
  lerp(from, to, 1 - Math.exp(-lambda * dtSeconds));

/** Hermite 0..1 ramp between two edges, as in GLSL. */
export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
