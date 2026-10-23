  // ================= POPULAR PLAN: ASCII snow drifting through the card =================
  // Fine dust far back and small star flakes nearer, each depth falling and swaying at its own pace.
  // A soft bank of snow gathers along the bottom edge. The pointer is a breeze: flakes lean away and swirl in its wake.
  (function snowfall() {
    const card = $('popPlan'), cv = $('popArt'); if (!card || !cv) return;
    let S = null, st = 0, holes = [], dust = [];
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
    function seed() {
      const { W, H } = S, n = Math.min(150, Math.round(W * H / 2400));
      dust = Array.from({ length: n }, () => newFlake({}, false));
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

    // the breeze
    let lastX = 0, lastT = 0;
    card.addEventListener('pointermove', e => {
      const o = card.getBoundingClientRect(), x = e.clientX - o.left, now = performance.now();
      if (ptr.on && now > lastT) ptr.vx = Math.max(-500, Math.min(500, (x - lastX) / Math.max(.008, (now - lastT) / 1000)));
      ptr.x = x; ptr.y = e.clientY - o.top; ptr.on = true; lastX = x; lastT = now;
    });
    card.addEventListener('pointerleave', () => { ptr.on = false; gust += ptr.vx * .05; });
    onResize(cv, () => { S = fit(cv); measureText(); seed(); draw(); });
    if (document.fonts) document.fonts.ready.then(() => { measureText(); draw(); });
    animate(card, dt => { if (!S) return; st += dt; stepSnow(dt); draw(); });
  })();

