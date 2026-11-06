// Renders the app icon and splash screen from the map outline. Run: node tools/make-icons.js
const fs = require("fs");
const { chromium } = require("playwright");
const M = JSON.parse(fs.readFileSync("vendor/india-paths.json", "utf8"));
const india = Object.values(M.paths).map((d) => `<path d="${d}"/>`).join("");
// New Delhi on the map (see src/geo.js projection).
const delhi = [186.2, 210.4];
const star = (x, y, r) => { let p = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; p += (i ? "L" : "M") + (x + rr * Math.cos(a)).toFixed(1) + "," + (y + rr * Math.sin(a)).toFixed(1); } return p + "Z"; };
const map = (fill, scale, cx, cy, starFill, sr = 16) => `<g transform="translate(${cx - 306 * scale},${cy - 348 * scale}) scale(${scale})"><g fill="${fill}" stroke="${fill}" stroke-width="1.2" stroke-linejoin="round">${india}</g><path d="${star(delhi[0], delhi[1], sr)}" fill="${starFill}" stroke="${fill}" stroke-width="3"/></g>`;
const svg = (w, h, bg, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${inner}</svg>`;
const Y = "#FAE37A", K = "#111111";
const files = {
  "assets/icon-only.png": [1024, 1024, svg(1024, 1024, Y, map(K, 1.08, 512, 520, Y, 30))],
  "assets/icon-foreground.png": [1024, 1024, svg(1024, 1024, null, map(K, 0.78, 512, 518, Y, 34))],
  "assets/icon-background.png": [1024, 1024, svg(1024, 1024, Y, "")],
  "assets/splash.png": [2732, 2732, svg(2732, 2732, K, map(Y, 1.25, 1366, 1250, K) +
    `<text x="1366" y="1830" text-anchor="middle" font-family="Georgia, serif" font-size="112" fill="${Y}">Search UPSC Atlas</text>`)],
};
files["assets/splash-dark.png"] = files["assets/splash.png"];
(async () => {
  const b = await chromium.launch();
  for (const [out, [w, h, content]] of Object.entries(files)) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${content}</body></html>`);
    await p.locator("svg").screenshot({ path: out, omitBackground: true });
    await p.close();
    console.log("wrote", out);
  }
  await b.close();
})();
