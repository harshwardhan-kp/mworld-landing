const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [n, w] of [['d', 1440], ['m', 400]]) {
    const p = await b.newPage({ viewport: { width: w, height: 1100 } });
    p.on('pageerror', e => console.log(n, 'pageerror:', e.message));
    p.on('console', m => m.type() === 'error' && console.log(n, 'console:', m.text()));
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(3000);
    const c = await p.$('#popPlan'); await c.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
    await c.screenshot({ path: `mworld/pop_${n}.png` });
    await p.waitForTimeout(1500); await c.screenshot({ path: `mworld/pop_${n}_b.png` });
    console.log(n, await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
  }
  await b.close();
})();
