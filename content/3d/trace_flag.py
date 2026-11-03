"""Trace the white shapes of FlagAsset 3@4x.png from its alpha channel into an SVG
and a JSON list of polygons that build_flag.py extrudes in Blender."""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

src = Path(sys.argv[1])
out = Path(__file__).parent

alpha = np.array(Image.open(src).convert("RGBA"))[:, :, 3]
# Upscale before thresholding so anti-aliased edges trace smoothly.
scale = 2
big = cv2.GaussianBlur(cv2.resize(alpha, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC), (0, 0), 2)
_, mask = cv2.threshold(big, 127, 255, cv2.THRESH_BINARY)
contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)

h, w = alpha.shape
shapes = []
for c, info in zip(contours, hierarchy[0]):
    if info[3] != -1 or cv2.contourArea(c) < 200:
        continue  # holes / specks; this logo has none
    pts = cv2.approxPolyDP(c, 0.4 * scale, True)[:, 0, :] / scale
    shapes.append(pts.tolist())

(out / "flag_shapes.json").write_text(json.dumps({"width": w, "height": h, "shapes": shapes}))
paths = "".join(
    '<path d="M' + " L".join(f"{x:.2f},{y:.2f}" for x, y in s) + ' Z"/>' for s in shapes
)
(out / "flag_mark.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="#ffffff">{paths}</svg>'
)
print(f"{len(shapes)} shapes, {sum(map(len, shapes))} points")
