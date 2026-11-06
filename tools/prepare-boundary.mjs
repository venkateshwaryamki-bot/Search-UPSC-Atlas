// Extracts the J&K–Ladakh UT boundary from a post-2019 district GeoJSON
// (udit-001/india-maps-data, geojson/india.geojson) and projects it onto the map.
// Usage: node tools/prepare-boundary.mjs path/to/india.geojson
// Writes vendor/jk-ladakh-line.json: [[x, y], ...] from the western end to the Himachal end.
import { readFileSync, writeFileSync } from "node:fs";

const LON0 = 68.0303, LAT0 = 37.0055, A = 20.5562, K = 1.02369;
const B = (A * 180) / Math.PI * K;
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const M0 = merc(LAT0);
const project = ([lon, lat]) => [(lon - LON0) * A, (M0 - merc(lat)) * B];

const d = JSON.parse(readFileSync(process.argv[2], "utf8"));
// State outline features have no district name.
const rings = (st) => d.features.filter((f) => f.properties.st_nm === st && !f.properties.district).flatMap((f) =>
  f.geometry.type === "Polygon" ? f.geometry.coordinates : f.geometry.coordinates.flat());
const key = (c) => c[0].toFixed(5) + "," + c[1].toFixed(5);
const jkKeys = new Set(rings("Jammu and Kashmir").flat().map(key));

// Runs of consecutive Ladakh vertices that are also J&K vertices.
let runs = [];
for (const ring of rings("Ladakh")) {
  // Start the walk at a vertex that is not shared, so a run never wraps around the ring's start.
  const open = ring.slice(0, -1);
  const start = open.findIndex((c) => !jkKeys.has(key(c)));
  if (start < 0) continue;
  const pts = open.slice(start).concat(open.slice(0, start + 1));
  let cur = [];
  for (const c of pts) {
    if (jkKeys.has(key(c))) cur.push(c);
    else { if (cur.length > 1) runs.push(cur); cur = []; }
  }
  if (cur.length > 1) runs.push(cur);
}
// Chain the runs into one line by joining nearest endpoints.
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
runs.sort((a, b) => b.length - a.length);
let line = runs.shift();
while (runs.length) {
  let best = null;
  runs.forEach((r, i) => {
    const opts = [[dist(line.at(-1), r[0]), i, false, true], [dist(line.at(-1), r.at(-1)), i, true, true],
                  [dist(line[0], r.at(-1)), i, false, false], [dist(line[0], r[0]), i, true, false]];
    for (const o of opts) if (!best || o[0] < best[0]) best = o;
  });
  if (best[0] > 0.05) break;
  let r = runs.splice(best[1], 1)[0]; if (best[2]) r = r.slice().reverse();
  line = best[3] ? line.concat(r) : r.concat(line);
}
// Western end first.
if (line[0][0] > line.at(-1)[0]) line.reverse();
let xy = line.map(project).filter((p, i, a) => i === 0 || i === a.length - 1 || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 0.4);
xy = xy.map((p) => [+p[0].toFixed(2), +p[1].toFixed(2)]);
writeFileSync("vendor/jk-ladakh-line.json", JSON.stringify(xy));
console.log(xy.length, "points from", xy[0], "to", xy.at(-1), "runs left", runs.length);
