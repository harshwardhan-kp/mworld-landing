const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [n, w] of [['d', 1366], ['m', 400]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    p.on('pageerror', e => console.log(n, 'pageerror:', e.message));
    p.on('console', m => m.type() === 'error' && console.log(n, 'console:', m.text()));
    await p.goto('file://' + process.argv[2]);
    const el = await p.$('.row.actor');
    await el.scrollIntoViewIfNeeded();
    for (const t of [1200, 3000, 5200]) { await p.waitForTimeout(t === 1200 ? 1200 : 1800); await el.screenshot({ path: `mworld/iso_${n}_${t}.png` }); }
  }
  await b.close();
})();
