// TypeScript stage: typed optics engine + canvas renderers.
interface VisionData { ecc: number[]; cones: number[]; rods: number[]; note: string }
declare const __VISION_DATA__: VisionData;
declare const __MOSAIC__: string;

const N_VITREOUS = 1.336;
type Verdict = { di: number; err: number; label: string; ok: boolean };
interface EyeModel { lengthMm: number; powerD: number; objectM: number; glassesD: number }

/** Image distance (mm) from vergence: V = U + P, di = n / V. */
function imageDistance(m: EyeModel): number {
  const U = m.objectM >= 6 ? 0 : -1 / m.objectM;
  return (N_VITREOUS / (U + m.powerD + m.glassesD)) * 1000;
}
function judge(m: EyeModel): Verdict {
  const di = imageDistance(m), err = di - m.lengthMm;
  if (Math.abs(err) < 0.25) return { di, err, label: "Sharp: focus lands on the retina", ok: true };
  return err < 0
    ? { di, err, label: "Focus in FRONT of retina (myopic blur): try a minus (concave) lens", ok: false }
    : { di, err, label: "Focus BEHIND retina (hyperopic blur): try a plus (convex) lens", ok: false };
}
function drawEye(c: HTMLCanvasElement, m: EyeModel): void {
  const g = c.getContext("2d")!, s = 9, lx = 150, rx = lx + m.lengthMm * s, v = judge(m);
  g.clearRect(0, 0, c.width, c.height);
  g.strokeStyle = "rgba(220,235,255,.6)"; g.lineWidth = 3;
  g.beginPath(); g.ellipse((lx + rx) / 2 - 10, 130, (rx - lx) / 2 + 30, 85, 0, 0, 7); g.stroke();
  g.strokeStyle = "#ff5c7a"; g.lineWidth = 6; g.beginPath(); g.moveTo(rx, 85); g.lineTo(rx, 175); g.stroke();
  g.fillStyle = "rgba(53,224,255,.35)"; g.strokeStyle = "#35e0ff"; g.lineWidth = 2;
  g.beginPath(); g.ellipse(lx, 130, 9, 36, 0, 0, 7); g.fill(); g.stroke();
  if (m.glassesD !== 0) { g.strokeStyle = m.glassesD < 0 ? "#ff7ad9" : "#ffd36b"; g.lineWidth = 3;
    g.beginPath(); g.ellipse(70, 130, m.glassesD < 0 ? 4 : 9, 40, 0, 0, 7); g.stroke(); }
  const fx = lx + v.di * s; g.strokeStyle = "#ffd36b"; g.lineWidth = 2;
  for (const dy of [-26, 0, 26]) {
    const k = dy === 0 ? 0 : 1 - (rx - lx) / (fx - lx), ye = 130 + dy * k;
    g.beginPath(); g.moveTo(20, 130 + dy); g.lineTo(lx, 130 + dy); g.lineTo(rx, ye); g.stroke();
  }
  g.fillStyle = "#fff"; g.beginPath(); g.arc(Math.min(fx, c.width - 8), 130, 4, 0, 7); g.fill();
}
function drawDensity(c: HTMLCanvasElement, d: VisionData): void {
  const g = c.getContext("2d")!, W = c.width, H = c.height, X = (e: number) => 40 + ((e + 60) / 120) * (W - 60), Y = (v: number) => H - 30 - (v / 160000) * (H - 50);
  g.strokeStyle = "#24305a"; g.fillStyle = "#9fb3d6"; g.font = "11px sans-serif";
  for (let e = -60; e <= 60; e += 20) { g.beginPath(); g.moveTo(X(e), 10); g.lineTo(X(e), H - 30); g.stroke(); g.fillText(e + "°", X(e) - 8, H - 14); }
  for (const [arr, col] of [[d.cones, "#ffd36b"], [d.rods, "#8a5cff"]] as [number[], string][]) {
    g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath(); arr.forEach((v, i) => { const x = X(d.ecc[i]), y = Y(v); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
  }
  g.fillStyle = "#ffd36b"; g.fillText("Cones (peak at fovea)", 50, 24); g.fillStyle = "#8a5cff"; g.fillText("Rods (zero at fovea)", 50, 40);
  g.fillStyle = "#ff7ad9"; g.fillText("Blind spot", X(15) - 24, H - 40);
}
function modal(html: string): HTMLDivElement {
  const m = document.createElement("div"); m.id = "lab"; m.innerHTML = `<div><button class="x">✕</button>${html}</div>`;
  m.addEventListener("click", e => { const t = e.target as HTMLElement; if (t === m || t.className === "x") m.remove(); });
  document.body.appendChild(m); return m;
}
function openLab(): void {
  const m = modal(`<h3 style="margin:0">🔬 Optics Lab: be the optometrist</h3><p style="color:var(--m);margin:4px 0">Change the eye and add glasses until the image is sharp.</p>
  <canvas width="640" height="230"></canvas><div class="lrow"><div id="blur">E</div><div><span id="vd" class="tag"></span></div></div>
  <label>Eye length: <b id="o1">24</b> mm (normal ≈ 24)</label><input id="s1" type="range" min="21" max="27" step=".1" value="25.5">
  <label>Object distance: <b id="o2">6+</b> m (6 = far)</label><input id="s2" type="range" min=".25" max="6" step=".05" value="6">
  <label>Glasses: <b id="o3">0</b> D (− concave, + convex)</label><input id="s3" type="range" min="-6" max="6" step=".25" value="0">`);
  const q = (id: string) => m.querySelector(id) as HTMLInputElement, c = m.querySelector("canvas") as HTMLCanvasElement;
  const run = (): void => {
    const e: EyeModel = { lengthMm: +q("#s1").value, powerD: 56, objectM: +q("#s2").value, glassesD: +q("#s3").value }, v = judge(e);
    q("#o1").textContent = String(e.lengthMm); q("#o2").textContent = e.objectM >= 6 ? "6+" : String(e.objectM); q("#o3").textContent = String(e.glassesD);
    (m.querySelector("#blur") as HTMLElement).style.filter = `blur(${Math.min(9, Math.abs(v.err) * 2.6)}px)`;
    const t = m.querySelector("#vd") as HTMLElement; t.textContent = v.label; t.className = "tag " + (v.ok ? "good" : "bad"); drawEye(c, e);
  };
  ["#s1", "#s2", "#s3"].forEach(id => q(id).addEventListener("input", run)); run();
}
function openData(): void {
  const m = modal(`<h3 style="margin:0">📊 Retina data (Python-generated)</h3><p style="color:var(--m);margin:4px 0">${__VISION_DATA__.note}</p>
  <canvas width="640" height="240"></canvas><h4 style="margin:12px 0 4px">Photoreceptor mosaic</h4>${__MOSAIC__}`);
  drawDensity(m.querySelector("canvas") as HTMLCanvasElement, __VISION_DATA__);
}
const nav = document.querySelector("#nav");
nav?.insertAdjacentHTML("afterbegin", `<button class="btn" id="b-lab">🔬 Lab</button><button class="btn" id="b-data">📊 Data</button>`);
document.getElementById("b-lab")?.addEventListener("click", openLab);
document.getElementById("b-data")?.addEventListener("click", openData);
