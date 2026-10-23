const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 460, height: 480 }, deviceScaleFactor: 3 });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort()); 
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(2500);
  await (await p.$('#popPlan')).screenshot({ path: process.argv[3] });
  await b.close();
})();
