const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const file = 'file://' + process.argv[2], tag = process.argv[3] || 'x', rm = process.argv[4] === 'reduce';
  for (const [name, w, h] of [['d1440', 1440, 900], ['d1366', 1366, 768], ['p400', 400, 860]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: rm ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage();
    p.on('console', m => m.type() === 'error' && console.log(name, 'console:', m.text()));
    p.on('pageerror', e => console.log(name, 'pageerror:', e.message));
    await p.goto(file);
    for (const t of rm ? [2500] : [5000, 4000]) {
      await p.waitForTimeout(t);
      const info = await p.evaluate(() => { const s = document.querySelector('section'); const r = s.getBoundingClientRect(); return [document.documentElement.scrollWidth, innerWidth, Math.round(r.height), Math.round(r.bottom)]; });
      console.log(name, 'sw/iw/heroH/heroBottom', info);
      await p.screenshot({ path: `mworld/hero/${tag}_${name}_${t}.png`, clip: { x: 0, y: 0, width: w, height: Math.round(h * (w < 500 ? 2.2 : 1.3)) }, fullPage: true });
    }
    await ctx.close();
  }
  await b.close();
})();
