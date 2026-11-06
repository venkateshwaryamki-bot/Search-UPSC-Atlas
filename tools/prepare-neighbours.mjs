// Projects neighbouring countries from Natural Earth's India point-of-view edition
// (ne_10m_admin_0_countries_ind.geojson, public domain) onto the map and clips them to the frame.
// Usage: node tools/prepare-neighbours.mjs path/to/ne_10m_admin_0_countries_ind.geojson
import { readFileSync, writeFileSync } from "node:fs";

const LON0 = 68.0303, LAT0 = 37.0055, A = 20.5562, K = 1.02369;
const B = (A * 180) / Math.PI * K;
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const M0 = merc(LAT0);
const project = ([lon, lat]) => [(lon - LON0) * A, (M0 - merc(lat)) * B];
const BOX = { x0: -70, y0: -50, x1: 690, y1: 760 };
const KEEP = { PAK: "Pakistan", AFG: "Afghanistan", TJK: "Tajikistan", CHN: "China", NPL: "Nepal", BTN: "Bhutan",
  BGD: "Bangladesh", MMR: "Myanmar", LKA: "Sri Lanka", MDV: "Maldives", THA: "Thailand", IDN: "Indonesia", IND: "India" };

// Sutherland–Hodgman clip of a ring against the frame.
function clip(ring) {
  const edges = [
    [(p) => p[0] >= BOX.x0, (a, b) => { const t = (BOX.x0 - a[0]) / (b[0] - a[0]); return [BOX.x0, a[1] + t * (b[1] - a[1])]; }],
    [(p) => p[0] <= BOX.x1, (a, b) => { const t = (BOX.x1 - a[0]) / (b[0] - a[0]); return [BOX.x1, a[1] + t * (b[1] - a[1])]; }],
    [(p) => p[1] >= BOX.y0, (a, b) => { const t = (BOX.y0 - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), BOX.y0]; }],
    [(p) => p[1] <= BOX.y1, (a, b) => { const t = (BOX.y1 - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), BOX.y1]; }],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out; out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i], prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) { if (!inside(prev)) out.push(cut(prev, cur)); out.push(cur); }
      else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}

const src = JSON.parse(readFileSync(process.argv[2], "utf8"));
const out = {};
for (const f of src.features) {
  const code = f.properties.ADM0_A3; if (!KEEP[code]) continue;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let d = "";
  for (const poly of polys) for (const ring of poly) {
    let pts = clip(ring.map(project));
    if (pts.length < 3) continue;
    const simp = [pts[0]];
    for (const p of pts.slice(1)) { const l = simp.at(-1); if (Math.hypot(p[0] - l[0], p[1] - l[1]) >= 0.7) simp.push(p); }
    if (simp.length < 3) continue;
    d += "M" + simp.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L") + "Z";
  }
  if (d) out[code] = { name: KEEP[code], d };
}
writeFileSync("vendor/neighbours.json", JSON.stringify(out));
console.log(Object.keys(out).join(","), JSON.stringify(out).length, "bytes");
