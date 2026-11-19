const { chromium } = require('playwright');
(async () => {
  const [,, list, scale, outdir, base = 'http://localhost:8765/iloveboston/mock/'] = process.argv;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: Number(scale || 1) });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  for (const item of list.split(',')) {
    const [s, t] = item.split(':');
    await page.goto(`${base}?s=${s}&t=${t}`);
    await page.waitForSelector('body[data-ready="1"]', { timeout: 30000 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${outdir}/${s}-${t}.png` });
    console.log('ok', s, t);
  }
  await browser.close();
})();
