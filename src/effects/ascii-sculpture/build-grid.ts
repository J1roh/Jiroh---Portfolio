import { smoothstep } from "../../lib/math/math";

/** Cell tiers: 0 empty, 1 background phrase (field), 2 logo edge (steel), 3 logo body (white). */
export type Level = 0 | 1 | 2 | 3;

export type Grid = {
  cols: number;
  rows: number;
  chars: string[];
  level: Uint8Array;
  /** Fixed per-cell noise in [0,1): drives the grainy hole, twinkle and ripple. */
  hash: Float32Array;
  /** Resting opacity: background letters fade with distance from the logo so the mark stays the focus. */
  rest: Float32Array;
  /** Logo-body cells that twinkle (hash above TWINKLE_HASH), so frames can visit just these. */
  twinkles: Uint32Array;
  /** The field alone, as if the logo were lifted off: what shows where a tilted logo no longer covers. */
  field: { chars: string[]; level: Uint8Array; rest: Float32Array };
};

export const TWINKLE_HASH = 0.985;

/** Where the logo sits, in px inside the canvas. */
export type Box = { x: number; y: number; w: number; h: number };

export type AlphaSampler = (u: number, v: number) => number;

const FILL = "JIROH";
/** Background letters keep this much opacity at the far corners. */
const FIELD_FLOOR = 0.35;
const BODY = 0.75;
const EDGE = 0.2;

// Same hashes as the Figma frames (hero/ascii-logo-reference.py), so code and design line up.
const rowHash = (x: number) => fract(Math.sin(x * 12.9898) * 43758.5453);
export const cellHash = (c: number, r: number) => fract(Math.sin(c * 127.1 + r * 311.7) * 43758.5453);
function fract(x: number) { return x - Math.floor(x); }

/**
 * Lays the phrase across every row (each row starting at its own offset) and marks which cells
 * fall inside the logo. Inside the logo, gaps become letters of JIROH so the shape reads solid.
 */
export function buildGrid(size: { cols: number; rows: number; cw: number; ch: number }, box: Box, alpha: AlphaSampler, phrase: string): Grid {
  const { cols, rows, cw, ch } = size;
  const count = cols * rows;
  const grid: Grid = {
    cols, rows,
    chars: new Array(count), level: new Uint8Array(count), hash: new Float32Array(count), rest: new Float32Array(count),
    twinkles: new Uint32Array(0),
    field: { chars: new Array(count), level: new Uint8Array(count), rest: new Float32Array(count) },
  };
  const twinkles: number[] = [];
  const centre = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
  const reach = Math.hypot(cols * cw, rows * ch) * 0.6;

  for (let r = 0; r < rows; r++) {
    const offset = Math.floor(rowHash(r + 0.5) * phrase.length);
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const u = (c * cw + cw / 2 - box.x) / box.w;
      const v = (r * ch + ch / 2 - box.y) / box.h;
      const ink = u >= 0 && u < 1 && v >= 0 && v < 1 ? alpha(u, v) : 0;
      let level: Level = ink > BODY ? 3 : ink > EDGE ? 2 : 1;
      const fieldChar = phrase[(c + offset) % phrase.length];
      let char = fieldChar;
      if (level >= 2 && (char === " " || char === "·")) char = FILL[(c + r) % FILL.length];
      if (char === " ") level = 0;
      grid.chars[i] = char;
      grid.level[i] = level;
      grid.hash[i] = cellHash(c, r);
      const distance = Math.hypot(c * cw - centre.x, r * ch - centre.y) / reach;
      const fieldRest = 1 - (1 - FIELD_FLOOR) * smoothstep(0.3, 1, distance);
      grid.rest[i] = level === 1 ? fieldRest : 1;
      grid.field.chars[i] = fieldChar;
      grid.field.level[i] = fieldChar === " " ? 0 : 1;
      grid.field.rest[i] = fieldRest;
      if (level === 3 && grid.hash[i] > TWINKLE_HASH) twinkles.push(i);
    }
  }
  grid.twinkles = Uint32Array.from(twinkles);
  return grid;
}

/** Loads an image and returns a sampler for its alpha channel at normalised (u, v). */
export async function loadAlpha(src: string): Promise<{ sample: AlphaSampler; aspect: number }> {
  const image = new Image();
  image.src = src;
  await image.decode().catch(() => { throw new Error(`ascii-sculpture: could not load ${src}`); });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("ascii-sculpture: 2D canvas is not available");
  context.drawImage(image, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  return {
    aspect: height / width,
    sample: (u, v) => data[(Math.floor(v * height) * width + Math.floor(u * width)) * 4 + 3] / 255,
  };
}
