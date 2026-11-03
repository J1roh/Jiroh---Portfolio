/** Trace resolution over the output: edges land on half device pixels before the downscale smooths them. */
const SUPERSAMPLE = 2;

/**
 * Traces the edge of an image's opaque shape into an anti-aliased stroke, as a PNG data URL (white on
 * transparent) at `width` × `height` device px. Traced at 2×: each edge pixel spreads its distance to the
 * pixels on the other side of the edge, coverage fades with that distance, then the result is scaled down.
 * Cost follows the outline's length, not the image's area. The image is inset by `padPx` on every side,
 * so a shape touching the image's border keeps its full stroke.
 */
export async function traceOutline(src: string, width: number, height: number, strokePx: number, padPx = 0): Promise<string> {
  const image = new Image();
  image.src = src;
  await image.decode().catch(() => { throw new Error(`logo-outline: could not load ${src}`); });

  const w = width * SUPERSAMPLE;
  const h = height * SUPERSAMPLE;
  const trace = document.createElement("canvas");
  trace.width = w;
  trace.height = h;
  const context = trace.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("logo-outline: 2D canvas is not available");
  const pad = padPx * SUPERSAMPLE;
  context.drawImage(image, pad, pad, w - pad * 2, h - pad * 2);
  const source = context.getImageData(0, 0, w, h).data;

  const inside = new Uint8Array(w * h);
  for (let i = 0; i < inside.length; i++) inside[i] = source[i * 4 + 3] > 127 ? 1 : 0;
  const at = (x: number, y: number) => (x >= 0 && y >= 0 && x < w && y < h ? inside[y * w + x] : 0);

  // Distance from each pixel centre to the nearest pixel centre across the edge.
  const across = new Float32Array(w * h).fill(Infinity);
  const radius = Math.max(0.5, strokePx / 2) * SUPERSAMPLE;
  const reach = Math.ceil(radius + 1.5);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const side = inside[y * w + x];
      if (at(x - 1, y) === side && at(x + 1, y) === side && at(x, y - 1) === side && at(x, y + 1) === side) continue;
      for (let dy = -reach; dy <= reach; dy++) {
        for (let dx = -reach; dx <= reach; dx++) {
          const px = x + dx, py = y + dy;
          if (px < 0 || py < 0 || px >= w || py >= h) continue;
          const p = py * w + px;
          if (inside[p] === side) continue;
          const distance = Math.hypot(dx, dy);
          if (distance < across[p]) across[p] = distance;
        }
      }
    }
  }

  // The edge sits halfway between the two centres; the stroke straddles it with a 1px soft rim.
  const out = context.createImageData(w, h);
  for (let i = 0; i < across.length; i++) {
    const coverage = Math.min(1, Math.max(0, radius + 0.5 - (across[i] - 0.5)));
    if (coverage === 0) continue;
    out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = 255;
    out.data[i * 4 + 3] = Math.round(coverage * 255);
  }
  context.putImageData(out, 0, 0);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const result = canvas.getContext("2d");
  if (!result) throw new Error("logo-outline: 2D canvas is not available");
  result.imageSmoothingQuality = "high";
  result.drawImage(trace, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}
