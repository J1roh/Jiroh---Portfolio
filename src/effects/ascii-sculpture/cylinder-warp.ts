/** Vertical strips the frame is redrawn in; enough that the bow reads smooth. */
const STRIPS = 72;

/**
 * Bows the finished frame as if it were printed on a vertical cylinder (after alche.studio's resting state):
 * each strip is squeezed toward the middle the further it is from the centre line, the 2D version of the
 * shader `uv.y = 0.5 + (uv.y - 0.5) * (1 + k * 4 * (uv.x - 0.5)^2)`. `k` 0 leaves the frame untouched.
 */
export function createCylinderWarp() {
  const scratch = document.createElement("canvas");
  const scratchContext = scratch.getContext("2d");
  if (!scratchContext) throw new Error("ascii-sculpture: 2D canvas is not available");

  return (context: CanvasRenderingContext2D, k: number, dpr: number) => {
    if (k <= 0.0005) return;
    const { width, height } = context.canvas;
    if (scratch.width !== width || scratch.height !== height) Object.assign(scratch, { width, height });
    scratchContext.clearRect(0, 0, width, height);
    scratchContext.drawImage(context.canvas, 0, 0);

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < STRIPS; i++) {
      const x0 = Math.floor((i * width) / STRIPS), x1 = Math.floor(((i + 1) * width) / STRIPS);
      const u = (x0 + x1) / 2 / width - 0.5;
      const drawn = height / (1 + k * 4 * u * u);
      context.drawImage(scratch, x0, 0, x1 - x0, height, x0, (height - drawn) / 2, x1 - x0, drawn);
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
}
