import { smoothstep } from "../../lib/math/math";

/** Light from the upper left, towards the viewer (unit vector to the light). */
const LIGHT = normalise(-0.45, -0.55, -0.7);
/**
 * Material "Mark_White" from the Blender model (flag_mark_clean.mtl): white diffuse, specular 0.5.
 * Its Ns 422 is softened to 60, since a glyph cell is far coarser than a pixel. SHEEN is a studio softbox above,
 * seen in reflection, which sweeps across the faces as the logo turns.
 */
const AMBIENT = 0.22;
const DIFFUSE = 0.78;
const SPECULAR = 0.5;
const SHININESS = 60;
const SHEEN = 0.3;

/** Blinn-Phong plus a softbox reflection, for a screen-space normal; the eye looks down +z. */
export function shade(nx: number, ny: number, nz: number) {
  const diffuse = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
  // Halfway between the light and the eye (0, 0, −1).
  const hx = LIGHT[0], hy = LIGHT[1], hz = LIGHT[2] - 1;
  const hl = Math.hypot(hx, hy, hz);
  const spec = Math.max(0, (nx * hx + ny * hy + nz * hz) / hl) ** SHININESS;
  // The eye ray (0, 0, 1) reflected; the softbox is overhead (−y).
  const reflectedY = -2 * nz * ny;
  return AMBIENT + DIFFUSE * diffuse + SPECULAR * spec + SHEEN * smoothstep(0.2, 0.8, -reflectedY);
}

function normalise(x: number, y: number, z: number) {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length] as const;
}
