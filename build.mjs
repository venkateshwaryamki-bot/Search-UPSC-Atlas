// Builds the self-contained page from src/ and vendor/.
//   dist/index.html     full HTML document (open directly or host on GitHub Pages)
//   dist/artifact.html  body-only version for publishing as a claude.ai artifact
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");
const parts = {
  "/*REGIONS_JS*/": read("src/regions.js"),
  "/*GEO_JS*/": read("src/geo.js"),
  "/*LAYERS_JS*/": read("src/layers.js"),
  "/*MAP_JSON*/": read("vendor/india-paths.json"),
  "/*RIVERS_JSON*/": read("vendor/india-rivers.json"),
  "/*NEIGHBOURS_JSON*/": read("vendor/neighbours.json"),
  "/*JKLINE_JSON*/": read("vendor/jk-ladakh-line.json"),
};
let body = read("src/app.html");
for (const [marker, content] of Object.entries(parts)) {
  if (!body.includes(marker)) throw new Error("Missing marker " + marker);
  body = body.replace(marker, () => content);
}
mkdirSync("dist", { recursive: true });
writeFileSync("dist/artifact.html", body);
writeFileSync(
  "dist/index.html",
  `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${body}\n</body>\n</html>\n`
);
console.log("Built dist/index.html and dist/artifact.html,", (body.length / 1024).toFixed(0), "KB");
