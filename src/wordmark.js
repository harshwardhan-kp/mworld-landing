  // ================= ASCII WORDMARK: paint the word =================
  // Every letter cell is a particle on a spring. Stroke across the word: the letters scatter, spring home and stay painted blue.
  // Tap: a ripple runs out from the finger. Paint the whole word and it erupts, wipes clean and asks for another go.
  const wm = $('wordmark'), wmHint = $('wmHint'), wmPct = $('wmPct'), wmLabel = wmHint.querySelector('b');
  let WMk = null, PT = null, wt = 0, wcw = 6, wch = 10, lastP = null, painted = 0, doneAt = -1, touched = false, nextNudge = 2.5;
  const waves = [], WMR = '-=+*#', SCR = '#*+=%&@$';
  function buildMask() {
    WMk = fit(wm); const { W, H } = WMk;
    wcw = W < 600 ? 4 : 6; wch = Math.round(wcw * 1.6);
    const cols = Math.floor(W / wcw), rows = Math.floor(H / wch);
    const off = document.createElement('canvas'); off.width = Math.max(1, cols); off.height = Math.max(1, rows);
    const o = off.getContext('2d'); o.fillStyle = C.fg; o.textAlign = 'center'; o.textBaseline = 'alphabetic';
    // a glyph drawn into the mask is squeezed by wcw/wch on screen, so stretch x by k = wch/wcw
    const k = wch / wcw;
    o.font = `600 100px Geist, sans-serif`;
    const m = o.measureText('M-WORLD'), asc = m.actualBoundingBoxAscent || 72, tw = m.width * k;
    const fs = Math.min(100 * cols * .96 / tw, 100 * rows * .8 / asc);
    o.save(); o.scale(k, 1); o.font = `600 ${fs}px Geist, sans-serif`;
    o.fillText('M-WORLD', cols / 2 / k, rows / 2 + fs * asc / 100 / 2); o.restore();
    const d = o.getImageData(0, 0, off.width, off.height).data, hx = [], hy = [], ch = [], hi = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const a = d[(j * cols + i) * 4 + 3] / 255; if (a < .2) continue;
      hx.push(i * wcw + wcw / 2); hy.push(j * wch + wch / 2); ch.push(a > .85 ? 4 : a > .6 ? 3 : a > .4 ? 2 : 1); hi.push(a > .6 ? 1 : 0);
    }
    const n = hx.length, F = () => new Float32Array(n);
    PT = { n, hx: Float32Array.from(hx), hy: Float32Array.from(hy), ch: Uint8Array.from(ch), hi: Uint8Array.from(hi),
           ox: F(), oy: F(), vx: F(), vy: F(), heat: F(), paint: new Uint8Array(n), seed: Float32Array.from({ length: n }, () => Math.random() * 8) };
    painted = 0; doneAt = -1; updateHint(); drawWM();
  }
  function updateHint() {
    const pct = PT ? Math.min(100, Math.floor(painted / PT.n * 100 / .96)) : 0;
    wmPct.textContent = doneAt >= 0 ? '100%' : pct + '%';
    wmLabel.textContent = doneAt >= 0 ? 'There it is. Again?' : touched ? 'Keep going' : 'Paint the word';
    wmHint.classList.toggle('done', doneAt >= 0);
  }
  function stir(x, y, pvx, pvy, rad, paints) {
    if (!PT) return; const p = PT, r2 = rad * rad;
    for (let k = 0; k < p.n; k++) {
      const dx = p.hx[k] + p.ox[k] - x, dy = p.hy[k] + p.oy[k] - y, d2 = dx * dx + dy * dy; if (d2 > r2) continue;
      const dd = Math.sqrt(d2) || 1, f = 1 - dd / rad, f2 = f * f;
      p.vx[k] += pvx * f2 * .5 + dx / dd * f2 * 120; p.vy[k] += pvy * f2 * .5 + dy / dd * f2 * 120;
      p.heat[k] = Math.min(1, p.heat[k] + f);
      if (paints && f > .18 && !p.paint[k] && doneAt < 0) { p.paint[k] = 1; painted++; }
    }
    if (paints && doneAt < 0 && painted >= p.n * .96) finish();
    updateHint();
  }
  function finish() {
    doneAt = wt;
    for (let k = 0; k < PT.n; k++) if (!PT.paint[k]) { PT.paint[k] = 1; painted++; }
    waves.push({ x: WMk.W / 2, y: WMk.H / 2, r: 0, max: WMk.W * .62, power: 320, speed: 900 });
    if (reduce) setTimeout(() => { PT.paint.fill(0); painted = 0; doneAt = -1; updateHint(); drawWM(); }, 1600);
  }
  const rad = () => WMk && WMk.W < 600 ? 36 : 58, clampV = v => Math.max(-1800, Math.min(1800, v));
  function wmStep(dt) {
    const p = PT; if (!p) return;
    const K = 170, D = 9.5;
    for (let k = 0; k < p.n; k++) {
      p.vx[k] += (-K * p.ox[k] - D * p.vx[k]) * dt; p.vy[k] += (-K * p.oy[k] - D * p.vy[k]) * dt;
      p.ox[k] = Math.max(-46, Math.min(46, p.ox[k] + p.vx[k] * dt)); p.oy[k] = Math.max(-34, Math.min(34, p.oy[k] + p.vy[k] * dt));
      if (p.heat[k] > 0) p.heat[k] = Math.max(0, p.heat[k] - dt * 1.3);
    }
    for (let w = waves.length - 1; w >= 0; w--) {
      const q = waves[w]; q.r += q.speed * dt; const fall = 1 - q.r / q.max;
      if (fall <= 0) { waves.splice(w, 1); continue; }
      for (let k = 0; k < p.n; k++) {
        const dx = p.hx[k] - q.x, dy = p.hy[k] - q.y, dd = Math.hypot(dx, dy) || 1;
        if (Math.abs(dd - q.r) > 12) continue;
        p.vx[k] += dx / dd * q.power * fall * .35; p.vy[k] += dy / dd * q.power * fall * .35; p.heat[k] = Math.min(1, p.heat[k] + fall * .9);
        if (q.paints && fall > .35 && !p.paint[k] && doneAt < 0) { p.paint[k] = 1; painted++; }
      }
      if (q.paints) { if (doneAt < 0 && painted >= p.n * .96) finish(); updateHint(); }
    }
    // after the eruption, a clean sweep wipes the paint from left to right and the game starts over
    if (doneAt >= 0) {
      const sweep = (wt - doneAt - 1.3) / .9 * WMk.W;
      if (sweep > 0) for (let k = 0; k < p.n; k++) if (p.paint[k] && p.hx[k] < sweep) { p.paint[k] = 0; painted--; p.heat[k] = Math.max(p.heat[k], .6); }
      if (sweep > WMk.W + 10) { painted = 0; doneAt = -1; updateHint(); }
    }
    // until someone touches it, the word nudges itself now and then to show it is alive
    if (!touched && wt > nextNudge) { const k = Math.floor(Math.random() * p.n); waves.push({ x: p.hx[k], y: p.hy[k], r: 0, max: 150, power: 140, speed: 420 }); nextNudge = wt + 4.5; }
  }
  function drawWM() {
    if (!PT) return; const { ctx, W, H } = WMk, p = PT; ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const q of waves) { ctx.globalAlpha = (1 - q.r / q.max) * .28; ctx.strokeStyle = C.accent; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.font = `600 ${wcw * 1.6}px ${MONO}`;
    // three passes, one colour each: plain ink, painted blue, and the hot cells that are still moving
    const tick = Math.floor(wt * 14);
    for (let pass = 0; pass < 3; pass++) {
      ctx.fillStyle = pass === 0 ? C.fg : pass === 1 ? C.accent : C.accent2;
      let la = -1;
      for (let k = 0; k < p.n; k++) {
        const hot = p.heat[k] > .22, which = hot ? 2 : p.paint[k] ? 1 : 0; if (which !== pass) continue;
        const al = hot ? .55 + p.heat[k] * .45 : p.hi[k] ? .92 : .55; if (al !== la) { ctx.globalAlpha = al; la = al; }
        ctx.fillText(hot ? SCR[(p.seed[k] + tick) & 7] : WMR[p.ch[k]], p.hx[k] + p.ox[k], p.hy[k] + p.oy[k]);
      }
    }
    ctx.globalAlpha = 1;
  }
  function first() { if (!touched) { touched = true; updateHint(); } }
  const local = e => { const r = wm.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, performance.now()]; };
  wm.addEventListener('pointermove', e => {
    const [x, y, t] = local(e);
    if (lastP) { const s = Math.max(8, t - lastP[2]) / 1000; stir(x, y, clampV((x - lastP[0]) / s), clampV((y - lastP[1]) / s), rad(), true); first(); }
    lastP = [x, y, t]; if (reduce) drawWM();
  });
  wm.addEventListener('pointerleave', () => { lastP = null; });
  wm.addEventListener('pointercancel', () => { lastP = null; });
  wm.addEventListener('pointerdown', e => {
    const [x, y, t] = local(e); lastP = [x, y, t]; first();
    waves.push({ x, y, r: 0, max: 280, power: 260, speed: 640, paints: true });
    stir(x, y, 0, 0, rad() * .9, true);
    if (reduce) drawWM();
  });
  onResize(wm, buildMask);
  if (document.fonts) document.fonts.ready.then(() => { fitH1(); readColors(); buildMask(); draw(); treeGeo(); });
  animate(wm, dt => { wt += dt; wmStep(dt); drawWM(); });
