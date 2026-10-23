  // ================= POPULAR PLAN: ASCII snow drifting through the card =================
  // Three depths of snow: fine dust far back, small star flakes in the middle, and a few large six-armed crystals up front.
  // Each crystal is traced onto its own character grid (six arms, two pairs of branches on each, a heart and bright tips),
  // and every stroke picks the glyph that follows it (- \ | /), so the crystals read as drawn, not stamped.
  // A soft bank of snow gathers along the bottom edge. The pointer is a breeze: flakes lean away and swirl in its wake;
  // a tap on the card throws up a puff of snow.
  (function snowfall() {
    const card = $('popPlan'), cv = $('popArt'); if (!card || !cv) return;
    let S = null, st = 0, holes = [], dust = [], crystals = [], puffs = [];
    const ptr = { x: -1e4, y: -1e4, vx: 0, on: false };
    let gust = 0;
    // where the card's words sit: snow behind them is dimmed so the text always reads
    function measureText() {
      const o = card.getBoundingClientRect(); holes = [];
      card.querySelectorAll('h3, .price, .credits, .tag, .badge, .btn, li').forEach(el => {
        const rg = document.createRange(); rg.selectNodeContents(el);
        for (const r of rg.getClientRects()) holes.push([r.left - o.left - 6, r.top - o.top - 3, r.right - o.left + 6, r.bottom - o.top + 3]);
      });
    }
    const behindText = (x, y) => { for (const h of holes) if (x > h[0] && x < h[2] && y > h[1] && y < h[3]) return true; return false; };
    const rnd = (a, b) => a + Math.random() * (b - a);

    function newFlake(f, top) {
      const { W, H } = S, z = Math.random();
      f.z = z; f.x = rnd(-10, W + 10); f.y = top ? rnd(-30, -6) : rnd(0, H);
      f.vx = 0; f.vy = 0; f.ph = rnd(0, 6.28); f.sw = rnd(.5, 1.2);
      f.fall = 10 + z * 26; f.size = 7 + z * 7;
      f.ch = z > .78 ? (Math.random() > .45 ? '*' : '+') : z > .4 ? (Math.random() > .5 ? '*' : '·') : (Math.random() > .3 ? '.' : '·');
      return f;
    }
    function newCrystal(c, top) {
      const { W, H } = S, R = rnd(30, Math.min(54, W * .13));
      c.R = R; c.x = rnd(W * .42, W - R * .6); c.y = top ? -R - rnd(0, H * .4) : rnd(R, H - R);
      c.vx = 0; c.vy = 0; c.a = rnd(0, 1.05); c.spin = rnd(.12, .3) * (Math.random() > .5 ? 1 : -1);
      c.fall = 7 + 14 * (R / 54); c.ph = rnd(0, 6.28);
      // each crystal grows its own branches
      c.br = [[rnd(.32, .42), rnd(.26, .36)], [rnd(.6, .7), rnd(.16, .24)]];
      c.tip = Math.random() > .5;
      return c;
    }
    function seed() {
      const { W, H } = S, n = Math.min(150, Math.round(W * H / 2400));
      dust = Array.from({ length: n }, () => newFlake({}, false));
      crystals = Array.from({ length: W < 360 ? 2 : 3 }, () => newCrystal({}, false));
    }

    // the glyph that follows a stroke: screen y runs down, so 45° is down-right
    function stroke(a) {
      const t = ((a % Math.PI) + Math.PI) % Math.PI, k = Math.round(t / (Math.PI / 4)) % 4;
      return '-\\|/'[k];
    }
    // trace a crystal onto its own character grid: six arms, two pairs of branches on each, a heart and bright tips
    const S60 = Math.PI / 3;
    function trace(c, cw, chh) {
      const cells = new Map();
      const put = (x, y, ch, w) => {
        const ix = Math.round(x / cw), iy = Math.round(y / chh), k = ix + ',' + iy, o = cells.get(k);
        if (!o || w > o.w) cells.set(k, { ix, iy, ch, w });
      };
      const line = (x0, y0, ang, len, w) => {
        const dx = Math.cos(ang), dy = Math.sin(ang), ch = stroke(ang), n = Math.ceil(len / (Math.min(cw, chh) * .45));
        for (let i = 1; i <= n; i++) put(x0 + dx * len * i / n, y0 + dy * len * i / n, ch, w);
        return [x0 + dx * len, y0 + dy * len];
      };
      for (let k = 0; k < 6; k++) {
        const arm = c.a + k * S60, ax = Math.cos(arm), ay = Math.sin(arm);
        const [tx, ty] = line(0, 0, arm, c.R * .9, 2);
        for (const [at, len] of c.br) {
          const bx = ax * c.R * at, by = ay * c.R * at;
          line(bx, by, arm + S60 * .85, c.R * len, 1); line(bx, by, arm - S60 * .85, c.R * len, 1);
        }
        put(tx + ax * cw * .6, ty + ay * chh * .6, c.tip ? 'o' : '*', 3);
      }
      put(0, 0, '*', 4);
      return cells.values();
    }

    function stepSnow(dt) {
      const { W, H } = S;
      gust *= Math.pow(.25, dt); ptr.vx *= Math.pow(.1, dt);
      const breeze = Math.sin(st * .23) * 6 + gust;
      const push = (o, mass) => {
        if (!ptr.on) return;
        const dx = o.x - ptr.x, dy = o.y - ptr.y, d = Math.hypot(dx, dy), R = 110;
        if (d < R && d > .01) { const f = (1 - d / R) * (1 - d / R) * 900 / mass; o.vx += (dx / d * f + ptr.vx * .9 * (1 - d / R)) * dt; o.vy += dy / d * f * .5 * dt; }
      };
      for (const f of dust) {
        push(f, .6 + f.z);
        f.vx *= Math.pow(.2, dt); f.vy *= Math.pow(.2, dt);
        f.x += (breeze * (.4 + f.z) + Math.sin(st * f.sw + f.ph) * (5 + f.z * 9) + f.vx) * dt;
        f.y += (f.fall + f.vy) * dt;
        if (f.y > H - bankAt(f.x) + 2 || f.x < -30 || f.x > W + 30) newFlake(f, true);
      }
      for (const c of crystals) {
        push(c, 2.4);
        c.vx *= Math.pow(.3, dt); c.vy *= Math.pow(.3, dt);
        c.x += (breeze * .5 + Math.sin(st * .4 + c.ph) * 7 + c.vx) * dt;
        c.y += (c.fall + c.vy) * dt;
        c.a += (c.spin + c.vx * .004) * dt;
        if (c.y - c.R > H || c.x < -c.R * 2 || c.x > W + c.R * 2) newCrystal(c, true);
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]; p.t += dt; p.vx *= Math.pow(.15, dt); p.vy = p.vy * Math.pow(.15, dt) + 30 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > p.life) puffs.splice(i, 1);
      }
    }
    // height of the snowbank along the bottom edge
    const bankAt = x => 9 + 4 * Math.sin(x * .031 + 1.3) + 3 * Math.sin(x * .077 + .4) + 2 * Math.sin(x * .19);

    const draw = () => {
      if (!S) return; const { ctx, W, H } = S;
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // dust and star flakes, far to near
      for (const f of dust) {
        const dim = behindText(f.x, f.y) ? .25 : 1, tw = .75 + .25 * Math.sin(st * 2 + f.ph * 3);
        ctx.font = `500 ${f.size.toFixed(1)}px ${MONO}`;
        ctx.fillStyle = f.z > .78 ? C.accent : C.accent2;
        ctx.globalAlpha = (.28 + f.z * .5) * tw * dim;
        ctx.fillText(f.ch, f.x, f.y);
      }
      // the crystals, each on its own grid so they glide instead of stepping
      const fs = 9, cw = fs * .6, chh = fs * .95, sparkle = Math.floor(st * 1.5);
      ctx.font = `600 ${fs}px ${MONO}`;
      for (const c of crystals) {
        for (const o of trace(c, cw, chh)) {
          const x = c.x + o.ix * cw, y = c.y + o.iy * chh; if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
          const dim = behindText(x, y) ? .22 : 1, glint = o.w < 3 && hash(o.ix + sparkle * 7, o.iy - sparkle * 3, c.ph * 10) > .95;
          ctx.fillStyle = glint ? C.accent2 : o.w >= 3 ? C.accentInk : o.w === 2 ? C.accent : C.accent2;
          ctx.globalAlpha = (glint ? 1 : o.w >= 3 ? .95 : o.w === 2 ? .8 : .75) * dim;
          ctx.fillText(glint ? '+' : o.ch, x, y);
        }
      }
      // a puff of snow where the card was tapped
      for (const p of puffs) {
        ctx.font = `500 ${p.size}px ${MONO}`; ctx.fillStyle = p.col;
        ctx.globalAlpha = Math.max(0, 1 - p.t / p.life) * .9; ctx.fillText(p.ch, p.x, p.y);
      }
      // the snowbank: denser toward the floor, with a slow shimmer along its crest
      ctx.font = `500 8px ${MONO}`;
      const bw = 5, bh = 6;
      for (let x = bw / 2; x < W; x += bw) {
        const top = H - bankAt(x);
        for (let y = H - bh / 2; y > top; y -= bh) {
          const depth = (H - y) / (H - top), crest = depth > .7;
          const g = hash(Math.round(x / bw), Math.round(y / bh), 2);
          const shim = crest && hash(Math.round(x / bw) + Math.floor(st * 1.2) * 5, 1, 9) > .9;
          ctx.fillStyle = shim ? C.accent : C.accent2;
          ctx.globalAlpha = shim ? .9 : (crest ? .4 : .3 + depth * .25) + g * .15;
          ctx.fillText(shim ? '*' : crest ? (g > .5 ? '.' : '·') : g > .55 ? ':' : g > .2 ? '·' : '*', x, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    // the breeze and the puff
    let lastX = 0, lastT = 0;
    card.addEventListener('pointermove', e => {
      const o = card.getBoundingClientRect(), x = e.clientX - o.left, now = performance.now();
      if (ptr.on && now > lastT) ptr.vx = Math.max(-500, Math.min(500, (x - lastX) / Math.max(.008, (now - lastT) / 1000)));
      ptr.x = x; ptr.y = e.clientY - o.top; ptr.on = true; lastX = x; lastT = now;
    });
    card.addEventListener('pointerleave', () => { ptr.on = false; gust += ptr.vx * .05; });
    card.addEventListener('pointerdown', e => {
      if (reduce) return;
      const o = card.getBoundingClientRect(), x = e.clientX - o.left, y = e.clientY - o.top;
      for (let i = 0; i < 18; i++) {
        const a = rnd(0, 6.28), sp = rnd(40, 150);
        puffs.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, t: 0, life: rnd(.6, 1.2), size: rnd(7, 12),
          ch: '*+·.'[Math.floor(rnd(0, 4))], col: Math.random() > .5 ? C.accent : C.accent2 });
      }
    });

    onResize(cv, () => { S = fit(cv); measureText(); seed(); draw(); });
    if (document.fonts) document.fonts.ready.then(() => { measureText(); draw(); });
    animate(card, dt => { if (!S) return; st += dt; stepSnow(dt); draw(); });
  })();
