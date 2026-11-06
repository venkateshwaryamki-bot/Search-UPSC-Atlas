// Projects Natural Earth river centrelines (public domain) onto the map's coordinate space.
// Usage: node tools/prepare-rivers.mjs path/to/ne_10m_rivers_lake_centerlines.geojson
// Writes vendor/india-rivers.json: { riverId: "svg path d", ... }
import { readFileSync, writeFileSync } from "node:fs";

// Mercator fitted to the outline in vendor/india-paths.json (checked against 55 city locations).
const LON0 = 68.0303, LAT0 = 37.0055, A = 20.5562, K = 1.02369;
const B = (A * 180) / Math.PI * K;
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const M0 = merc(LAT0);
const project = ([lon, lat]) => [(lon - LON0) * A, (M0 - merc(lat)) * B];

// Natural Earth feature names -> our river ids.
const NAMES = {
  Indus: "indus", Jhelum: "jhelum", Chenab: "chenab", Ravi: "ravi", Beas: "beas", Sutlej: "sutlej",
  Ganges: "ganga", Yamuna: "yamuna", "Ghäghara": "ghaghara", Gandak: "gandak", Sapt: "kosi", Son: "son",
  Chambal: "chambal", Betwa: "betwa", Banas: "banas",
  Brahmaputra: "brahmaputra", Dihang: "brahmaputra", Yarlung: "brahmaputra", Tista: "teesta",
  "Mahäna Nadï": "mahanadi", Brahmani: "brahmani", "Godävari": "godavari", Wainganga: "wainganga",
  Indravati: "indravati", Krishna: "krishna", Bhima: "bhima", Tungabhadra: "tungabhadra",
  Cauvery: "kaveri", Kolidam: "kaveri", Penner: "penner", Narmada: "narmada", Tapi: "tapi", Mahi: "mahi",
};

const src = JSON.parse(readFileSync(process.argv[2], "utf8"));
const out = {};
const inBox = ([lon, lat]) => lon > 66 && lon < 99 && lat > 5 && lat < 38;
for (const f of src.features) {
  const id = NAMES[f.properties.name];
  if (!id) continue;
  const lines = f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const line of lines) {
    if (!line.some(inBox)) continue;
    let d = "", last = null;
    line.map(project).forEach((p, i, arr) => {
      // Drop points closer than 0.8 map units to the previous one, but keep the end point.
      if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.8 && i < arr.length - 1) return;
      d += (last ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1);
      last = p;
    });
    if (d.includes("L")) out[id] = (out[id] || "") + d;
  }
}
writeFileSync("vendor/india-rivers.json", JSON.stringify(out));
console.log(Object.keys(out).length, "rivers,", JSON.stringify(out).length, "bytes");
