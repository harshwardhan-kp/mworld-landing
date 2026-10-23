const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const file = 'file://' + process.argv[2];
  for (const [name, w] of [['desk', 1366], ['phone', 400]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('console', m => m.type() === 'error' && console.log(name, 'console:', m.text()));
    p.on('pageerror', e => console.log(name, 'pageerror:', e.message));
    await p.goto(file); await p.waitForTimeout(9000);
    const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    console.log(name, 'scrollWidth/inner', sw);
    await p.screenshot({ path: `${name}.png`, fullPage: true });
  }
  await b.close();
})();
