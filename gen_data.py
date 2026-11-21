"""Python stage: builds retina data (JSON) and a photoreceptor mosaic (SVG)."""
import json, math, random

def cones(e):   # cells/mm^2, illustrative model after Osterberg (1935)
    return 4500 + 150000 * math.exp(-abs(e) / 0.9)

def rods(e):
    return 150000 * math.exp(-((abs(e) - 18) / 22) ** 2) * (1 - math.exp(-abs(e) / 2.5))

def blind(e):   # optic disc ~12-18 deg on the temporal side
    return 12 <= e <= 18

ecc = list(range(-60, 61))
data = {
    "ecc": ecc,
    "cones": [0 if blind(e) else round(cones(e)) for e in ecc],
    "rods": [0 if blind(e) else round(rods(e)) for e in ecc],
    "note": "Illustrative curves after Osterberg (1935); positive = temporal retina.",
}
json.dump(data, open("data/data.json", "w"))

random.seed(7)
W, H, step = 400, 190, 11
out = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg"><rect width="{W}" height="{H}" rx="14" fill="#060b1c"/>']
cx, cy = W / 2, H / 2
for row in range(int(H / (step * .87)) + 1):
    for col in range(int(W / step) + 1):
        x = col * step + (step / 2 if row % 2 else 0); y = row * step * .87
        d = math.hypot(x - cx, (y - cy) * 1.4)
        p_cone = math.exp(-d / 55)
        x += random.uniform(-2, 2); y += random.uniform(-2, 2)
        if random.random() < p_cone:
            r = random.random(); c = "#ff5c7a" if r < .55 else "#4ce0a0" if r < .93 else "#4a7bff"
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.4" fill="{c}"/>')
        else:
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.9" fill="#b9c6e8" opacity=".75"/>')
out.append('<text x="12" y="20" fill="#ffd36b" font-size="12" font-family="sans-serif">Fovea: dense cones (red/green/blue)</text>')
out.append('<text x="12" y="%d" fill="#b9c6e8" font-size="12" font-family="sans-serif">Periphery: mostly rods (grey)</text></svg>' % (H - 10))
open("data/mosaic.svg", "w").write("".join(out))
print("python: data.json + mosaic.svg ready")
