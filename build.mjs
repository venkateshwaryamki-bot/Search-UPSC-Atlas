// Builds the self-contained page from src/ and vendor/.
//   dist/index.html     full HTML document (open directly or host on GitHub Pages)
//   dist/artifact.html  body-only version for publishing as a claude.ai artifact
//   www/                offline copy with bundled fonts, used by the Android and iOS apps (Capacitor)
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";

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
const doc = (inner, head = "") => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}<style>:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }</style>
</head>
<body>
${inner}
</body>
</html>
`;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/artifact.html", body);
writeFileSync("dist/index.html", doc(body));

// App build: swap Google Fonts for the bundled copies so the app works with no internet.
const offline = body.replace(/<!--FONTS-->[\s\S]*?<!--\/FONTS-->/, '<link rel="stylesheet" href="fonts/fonts.css">');
if (offline.includes("fonts.googleapis.com")) throw new Error("App build still references Google Fonts");
rmSync("www", { recursive: true, force: true });
mkdirSync("www", { recursive: true });
cpSync("app/fonts", "www/fonts", { recursive: true });
writeFileSync("www/index.html", doc(offline, '<meta name="color-scheme" content="light dark">\n'));
console.log("Built dist/ and www/,", (body.length / 1024).toFixed(0), "KB");
