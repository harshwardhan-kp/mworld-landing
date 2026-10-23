const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [n, w, h] of [['d', 1440, 1000], ['m', 400, 860]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => console.log(n, 'pageerror:', e.message));
    p.on('console', m => m.type() === 'error' && console.log(n, 'console:', m.text()));
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
    const o = await p.$('#orbitWrap'); await o.scrollIntoViewIfNeeded(); await p.waitForTimeout(2000);
    await o.screenshot({ path: `mworld/v6_orbit_${n}.png` });
    const t = await p.$('#tree'); await t.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
    const tb = await t.boundingBox(); await p.screenshot({ path: `mworld/v6_tree_${n}.png`, clip: { x: tb.x + tb.width / 2 - 200, y: Math.max(0, tb.y), width: 400, height: Math.min(360, tb.height) } });
    const c = await p.$('#wordmark'); await c.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
    const bb = await c.boundingBox();
    // a stroke across the first half of the word, then a tap
    await p.mouse.move(bb.x + 10, bb.y + bb.height * .4);
    for (let i = 0; i <= 30; i++) { await p.mouse.move(bb.x + 10 + i * bb.width * .018, bb.y + bb.height * (.35 + .3 * Math.sin(i / 4))); await p.waitForTimeout(16); }
    await p.waitForTimeout(60);
    await c.screenshot({ path: `mworld/v6_wm_mid_${n}.png` });
    await p.mouse.click(bb.x + bb.width * .7, bb.y + bb.height * .5); await p.waitForTimeout(180);
    await c.screenshot({ path: `mworld/v6_wm_tap_${n}.png` });
    await p.waitForTimeout(1500);
    await c.screenshot({ path: `mworld/v6_wm_rest_${n}.png` });
    console.log(n, 'hint:', await p.$eval('#wmHint', e => e.textContent), await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
  }
  await b.close();
})();
