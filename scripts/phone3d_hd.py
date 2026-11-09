"""HD phone renders for the site's Emails section: same look as phone3d_v3.py, drawn at S× and supersampled.
Usage: python phone3d_hd.py <email.png> <out_dir> [S]  -> phone-{lock,open,read,footer}.webp at (1000*S) × (1100*S)."""
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

EMAIL, OUT = sys.argv[1], sys.argv[2]
S = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
SS = 2  # supersample factor for edges, downsampled at the end
K = S * SS
os.makedirs(OUT, exist_ok=True)
k = lambda v: int(round(v * K))
PW, PH, R = k(420), k(860), k(58)
SW, SH, SR, B = k(384), k(824), k(42), k(18)
FD = 'C:/Windows/Fonts/'
font = lambda name, size: ImageFont.truetype(FD + name, k(size))

def rounded_mask(size, r):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], r, fill=255)
    return m

def wallpaper():
    rng = np.random.default_rng(4)
    y, x = np.mgrid[0:SH, 0:SW].astype(float)
    glow = np.exp(-(((x - SW * 0.3) / (SW * 0.68)) ** 2 + ((y - SH * 0.35) / (SH * 0.41)) ** 2))
    base = np.array([14, 20, 28], float); light = np.array([58, 74, 96], float)
    img = base + (light - base) * glow[..., None] + rng.normal(0, 4, (SH, SW))[..., None]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')

def email_crop(scroll, width=SW, height=SH):
    e = Image.open(EMAIL).convert('RGB')
    e = e.resize((width, int(e.height * width / e.width)), Image.LANCZOS)
    top = int((e.height - height) * scroll)
    return e.crop((0, top, width, top + height)).convert('RGBA')

def banner(img, y, alpha=235):
    x0, x1 = k(14), SW - k(14)
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    ld.rounded_rectangle([x0, y, x1, y + k(112)], k(24), fill=(236, 239, 242, alpha))
    ld.rounded_rectangle([x0 + k(14), y + k(16), x0 + k(50), y + k(52)], k(9), fill=(159, 178, 174, 255))
    img.alpha_composite(layer)
    d = ImageDraw.Draw(img)
    d.text((x0 + k(22), y + k(22)), 'SL', font=font('segoeuib.ttf', 15), fill=(255, 255, 255))
    d.text((x0 + k(62), y + k(14)), 'Salt Lab', font=font('segoeuib.ttf', 16), fill=(20, 24, 30))
    d.text((x1 - k(50), y + k(15)), 'now', font=font('segoeui.ttf', 14), fill=(110, 118, 128))
    d.text((x0 + k(62), y + k(36)), 'Come back to the ritual', font=font('segoeuib.ttf', 15), fill=(20, 24, 30))
    d.text((x0 + k(62), y + k(58)), "It's been a while\u2014here's $50 towards", font=font('segoeui.ttf', 14), fill=(70, 78, 88))
    d.text((x0 + k(62), y + k(78)), 'whichever part of the routine\u2026', font=font('segoeui.ttf', 14), fill=(70, 78, 88))

def screen(state):
    if state == 'lock':
        s = wallpaper(); d = ImageDraw.Draw(s)
        f = font('segoeuisl.ttf' if os.path.exists(FD + 'segoeuisl.ttf') else 'segoeui.ttf', 88)
        w = d.textlength('9:41', font=f); d.text(((SW - w) / 2, k(96)), '9:41', font=f, fill=(255, 255, 255))
        f2 = font('segoeui.ttf', 17); t = 'Monday 9 November'; w = d.textlength(t, font=f2)
        d.text(((SW - w) / 2, k(80)), t, font=f2, fill=(220, 226, 232))
        banner(s, k(300))
        d.rounded_rectangle([SW / 2 - k(66), SH - k(22), SW / 2 + k(66), SH - k(16)], k(3), fill=(255, 255, 255))
        return s
    if state == 'open':
        s = wallpaper().filter(ImageFilter.GaussianBlur(k(6)))
        card = email_crop(0.0, SW - k(36), SH - k(210))
        s.paste(card, (k(18), k(190)), rounded_mask(card.size, k(26)))
        banner(s, k(70), alpha=200)
        return s
    return email_crop({'read': 0.45, 'footer': 0.95}[state])

def phone(state):
    body = Image.new('RGBA', (PW, PH), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle([0, 0, PW - 1, PH - 1], R, fill=(8, 11, 16, 255), outline=(52, 64, 80, 255), width=k(2))
    sc = screen(state)
    yy, xx = np.mgrid[0:SH, 0:SW]
    g = np.clip(1 - np.abs((xx / SW) * 0.8 + (yy / SH) * 0.6 - 0.55) * 4, 0, 1) * 0.06 * 255
    sheen = Image.fromarray(np.dstack([np.full((SH, SW), 255)] * 3 + [g]).astype(np.uint8), 'RGBA')
    sc = Image.alpha_composite(sc, sheen)
    body.paste(sc, (B, B), rounded_mask((SW, SH), SR))
    ImageDraw.Draw(body).rounded_rectangle([PW // 2 - k(52), B + k(12), PW // 2 + k(52), B + k(40)], k(14), fill=(5, 8, 12, 255))
    return body

def project(ry, rx, d):
    pts = []
    for x, y in [(-PW / 2, -PH / 2), (PW / 2, -PH / 2), (PW / 2, PH / 2), (-PW / 2, PH / 2)]:
        x1 = x * math.cos(ry); z1 = -x * math.sin(ry)
        y2 = y * math.cos(rx) - z1 * math.sin(rx); z2 = y * math.sin(rx) + z1 * math.cos(rx)
        f = d / (d + z2); pts.append((x1 * f, y2 * f))
    return pts

def coeffs(dst, src):
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()

def render(state, ry_deg, rx_deg):
    ph = phone(state); ry, rx = math.radians(ry_deg), math.radians(rx_deg)
    W, H = k(1000), k(1100); cx, cy = W / 2, H / 2 - k(40)
    quad = [(cx + x, cy + y) for x, y in project(ry, rx, k(1500))]
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([cx - k(230), cy + PH / 2 - k(10), cx + k(230), cy + PH / 2 + k(60)], fill=(0, 0, 0, 160))
    canvas = Image.alpha_composite(canvas, sh.filter(ImageFilter.GaussianBlur(k(28))))
    warped = ph.transform((W, H), Image.PERSPECTIVE, coeffs(quad, [(0, 0), (PW, 0), (PW, PH), (0, PH)]), Image.BICUBIC)
    t = int((16 * math.sin(abs(ry)) + 4) * K); alpha = warped.split()[3]
    for i in range(t, 0, max(1, t // 24) * -1):
        shade = 34 + int(18 * i / t)
        layer = Image.new('RGBA', (W, H), (shade - 10, shade - 4, shade + 6, 255)); layer.putalpha(alpha)
        s2 = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s2.paste(layer, (i, i // 4), layer)
        canvas = Image.alpha_composite(canvas, s2)
    canvas = Image.alpha_composite(canvas, warped)
    canvas = canvas.resize((int(1000 * S), int(1100 * S)), Image.LANCZOS)
    canvas.save(os.path.join(OUT, 'phone-%s.webp' % state), 'WEBP', quality=88, method=6)

for st, ry, rx in [('lock', 20, 8), ('open', 16, 6), ('read', 12, 4), ('footer', 6, 2)]:
    render(st, ry, rx); print('ok', st)
