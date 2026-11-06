// Builds the self-contained page from src/ and vendor/.
//   dist/index.html     full HTML document (open directly or host on GitHub Pages)
//   dist/artifact.html  body-only version for publishing as a claude.ai artifact
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const app = readFileSync("src/app.html", "utf8");
const regions = readFileSync("src/regions.js", "utf8");
const map = readFileSync("vendor/india-paths.json", "utf8");
const body = app
  .replace("/*REGIONS_JS*/", () => regions)
  .replace("/*MAP_JSON*/", () => map);

mkdirSync("dist", { recursive: true });
writeFileSync("dist/artifact.html", body);
writeFileSync(
  "dist/index.html",
  `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${body}\n</body>\n</html>\n`
);
console.log("Built dist/index.html and dist/artifact.html");
