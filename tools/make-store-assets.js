// Renders store screenshots and the Play feature graphic from the app build in www/.
// Run: node build.mjs && node tools/make-store-assets.js
const fs = require("fs");
const { chromium } = require("playwright");
const APP = "file://" + process.cwd() + "/www/index.html";
const Y = "#FAE37A", K = "#111111";

const SCENES = [
  { id: "1-map", caption: "Every state, river and range of India" },
  { id: "2-state", caption: "Tap any state for exam-ready facts", hash: "#kl" },
  { id: "3-quiz", caption: "Quizzes you answer right on the map", quiz: true },
  { id: "4-daily", caption: "Daily challenge, streaks and score cards", daily: true },
  { id: "5-layers", caption: "Rivers, UNESCO sites, tiger reserves", hash: "#river-ganga", layers: { unesco: true, parks: true } },
  { id: "6-themes", caption: "Soil, climate and crop maps", base: "soils" },
];
const DEVICES = {
  "android-phone": { w: 360, h: 640, scale: 3, dir: "store/android/phone" },      // 1080 x 1920
  "iphone-6.9": { w: 440, h: 956, scale: 3, dir: "store/ios/iphone-6.9" },         // 1320 x 2868
  "ipad-13": { w: 1032, h: 1376, scale: 2, dir: "store/ios/ipad-13" },             // 2064 x 2752
};

async function shoot(browser, dev, scene) {
  // The app is rendered below a caption band, at the same total size the store expects.
  const band = Math.round(dev.h * 0.16), appH = dev.h - band;
  const ctx = await browser.newContext({ viewport: { width: dev.w, height: appH }, deviceScaleFactor: dev.scale, colorScheme: "light", hasTouch: true });
  await ctx.addInitScript((layers) => {
    try {
      localStorage.setItem("atlas-welcomed", "true");
      localStorage.setItem("atlas-layers2", JSON.stringify(Object.assign({ capitals: true, rivers: true, ranges: false, passes: false, grid: false }, layers)));
      // Sample history so the Daily screen shows a streak.
      const t = new Date(Date.now() + 5.5 * 3600e3), all = {};
      [[1, 8], [2, 9], [3, 7], [4, 10], [5, 6], [7, 8], [8, 9]].forEach(([o, sc]) => { const d = new Date(t - o * 864e5).toISOString().slice(0, 10); all[d] = { date: d, score: sc, marks: Array.from({ length: 10 }, (_, i) => (i < sc ? "right" : "wrong")) }; });
      localStorage.setItem("atlas-daily", JSON.stringify(all));
    } catch (e) {}
  }, scene.layers || {});
  const p = await ctx.newPage();
  await p.goto(APP + (scene.hash || ""));
  await p.waitForTimeout(1100);
  if (scene.base) { await p.click(`[data-qbase="${scene.base}"]`); await p.waitForTimeout(300); }
  if (scene.daily) { await p.click(dev.w > 1100 ? "#tab-daily" : "[data-nav=daily]"); }
  if (scene.quiz) {
    await p.click(dev.w > 1100 ? "#tab-practice" : "[data-nav=practice]"); await p.click("[data-mode=states]"); await p.waitForTimeout(700);
    // Answer the first question correctly so the feedback shows.
    await p.evaluate(() => { const em = document.querySelector(".qprompt em, .prompt em"); const r = em && window.REGIONS.find((x) => x.name === em.textContent); if (r) document.querySelector(`.region[data-id=${r.id}]`).dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  }
  await p.waitForTimeout(900);
  const shot = await p.screenshot({ type: "png" });
  await ctx.close();
  const page = await browser.newPage({ viewport: { width: dev.w, height: dev.h }, deviceScaleFactor: dev.scale });
  await page.setContent(`<html><body style="margin:0;background:${K}">
    <div style="height:${band}px;display:flex;align-items:center;justify-content:center;padding:0 ${Math.round(dev.w * 0.06)}px;box-sizing:border-box">
      <div style="font-family:Georgia,serif;color:${Y};font-size:${Math.round(Math.min(dev.w * 0.068, 46))}px;line-height:1.18;text-align:center">${scene.caption}</div></div>
    <img src="data:image/png;base64,${shot.toString("base64")}" style="display:block;width:${dev.w}px;height:${appH}px"></body></html>`);
  fs.mkdirSync(dev.dir, { recursive: true });
  await page.screenshot({ path: `${dev.dir}/${scene.id}.png` });
  await page.close();
}

(async () => {
  const b = await chromium.launch();
  for (const dev of Object.values(DEVICES)) for (const s of SCENES) await shoot(b, dev, s);
  // Google Play feature graphic, 1024 x 500.
  const M = JSON.parse(fs.readFileSync("vendor/india-paths.json", "utf8"));
  const india = Object.values(M.paths).map((d) => `<path d="${d}"/>`).join("");
  const fg = await b.newPage({ viewport: { width: 1024, height: 500 } });
  await fg.setContent(`<html><body style="margin:0"><div style="width:1024px;height:500px;background:${K};position:relative;overflow:hidden;font-family:Georgia,serif">
    <svg viewBox="0 0 612 696" style="position:absolute;right:40px;top:20px;height:460px"><g fill="${Y}">${india}</g></svg>
    <div style="position:absolute;left:64px;top:150px;width:560px">
      <div style="color:${Y};font-size:64px;line-height:1.05">Search UPSC Atlas</div>
      <div style="color:#f3f0e6;font-size:28px;margin-top:22px;line-height:1.35;font-family:Arial,sans-serif">Interactive map of India for UPSC Prelims and Mains</div></div></div></body></html>`);
  fs.mkdirSync("store/android", { recursive: true });
  await fg.screenshot({ path: "store/android/feature-graphic.png" });
  fs.copyFileSync("assets/icon-only.png", "store/android/icon-512.png");
  await b.close();
  console.log("Store assets written to store/");
})();
