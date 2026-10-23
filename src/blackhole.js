  // ================= POPULAR PLAN: an ASCII black hole beside the price =================
  // Drawn the way the classic ASCII renderings are: the hole itself is empty space, defined only by what surrounds it.
  // A lensed ring of light wraps the void (thick and bright over the top, thin beneath), a thin accretion disk
  // cuts straight across the middle and passes in front of the void, brighter on its approaching (left) side.
  // Density comes from a ten-step ramp; colour deepens with density. One steady speed, no interaction.
  (function blackHole() {
    const card = $('popPlan'), cv = $('popArt'); if (!card || !cv) return;
    const BR = ' .:-=+*#%@';
    let BH = null, bt = 0, holes = [];
    // where the card's words actually sit: characters behind them are dimmed so the text always reads
    function measureText() {
      const o = card.getBoundingClientRect(); holes = [];
      card.querySelectorAll('h3, .price, .credits, .tag, .badge, .btn, li, .p, .c, .g').forEach(el => {
        const rg = document.createRange(); rg.selectNodeContents(el);
        for (const r of rg.getClientRects()) holes.push([r.left - o.left - 6, r.top - o.top - 3, r.right - o.left + 6, r.bottom - o.top + 3]);
      });
    }
    const behindText = (x, y) => { for (const h of holes) if (x > h[0] && x < h[2] && y > h[1] && y < h[3]) return true; return false; };
    function geo() {
      const { W } = BH, rs = Math.max(48, Math.min(W * .172, 74));
      return { rs, cx: W - rs * 1.45, cy: 158, cw: Math.max(4.6, rs * .092), ch: Math.max(7.4, rs * .152) };
    }
    const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    // brightness of the scene at (u, v), in units of the shadow radius; v grows downwards
    function field(u, v, t) {
      const d = Math.hypot(u, v), th = Math.atan2(v, u);
      let I = 0;
      // the accretion disk, seen almost edge on
      const K = .14, r = Math.hypot(u, v / K);
      const inDisk = r > 1.32 && r < 3.7 && Math.abs(v) < K * 3.7;
      let disk = 0;
      if (inDisk) {
        const prof = sm(1.32, 1.55, r) * Math.pow(1.45 / r, 1.35) * (1 - sm(2.9, 3.7, r));
        const ph = Math.atan2(v / K, u), w = .9 * Math.pow(1.4 / r, 1.5);
        const swirl = .62 + .24 * Math.sin(ph * 4 - t * w * 2.2 + r * 6.5) + .14 * Math.sin(ph * 9 + t * w * 1.3 - r * 11);
        const dop = 1 + .55 * (-u / r);
        disk = prof * swirl * dop * 1.55;
      }
      const front = v > 0;
      // the void: nothing comes through except the near side of the disk
      if (d < 1) return front ? disk : 0;
      // photon ring hugging the shadow, then the lensed image of the disk's far side
      const top = v < 0;
      const ring = Math.exp(-Math.pow((d - 1.05) / .06, 2)) * .9;
      const wl = top ? .34 : .16, cl = top ? 1.36 : 1.2;
      const lens = Math.exp(-Math.pow((d - cl) / wl, 2)) * (top ? 1 : .6);
      const lensTex = .78 + .22 * Math.sin(th * 7 - t * .9 + d * 9) ;
      const side = 1 + .35 * (-u / d);
      I = (ring + lens * lensTex) * side + disk;
      return I;
    }
    let stars = [];
    function seed() {
      const { W, H } = BH, g = geo(); stars = [];
      for (let i = 0; i < 40; i++) {
        const x = g.cx + (hash(i, 2, 7) - .5) * g.rs * 7, y = g.cy + (hash(i, 9, 3) - .5) * g.rs * 4.4;
        const u = (x - g.cx) / g.rs, v = (y - g.cy) / g.rs;
        if (x < W * .55 || x > W - 4 || y < 18 || y > H - 8) continue;
        if (Math.hypot(u, v) < 2.1 || (Math.abs(v) < .55 && Math.abs(u) < 4)) continue;
        stars.push({ x, y, ph: hash(i, 4, 4) * 6.28, big: hash(i, 6, 1) > .82 });
      }
    }
    const draw = () => {
      if (!BH) return; const { ctx, W, H } = BH, { rs, cx, cy, cw, ch } = geo(), t = bt;
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `500 ${(ch * 1.05).toFixed(1)}px ${MONO}`;
      ctx.fillStyle = C.accent;
      for (const s of stars) { ctx.globalAlpha = .22 + .28 * (.5 + .5 * Math.sin(t * .6 + s.ph)); ctx.fillText(s.big ? '+' : '.', s.x, s.y); }
      const nx = Math.ceil(rs * 4.1 / cw), ny = Math.ceil(rs * 2.05 / ch);
      // three passes so each colour is set once: faint, mid, dense
      const cells = [];
      for (let j = -ny; j <= ny; j++) for (let i = -nx; i <= nx; i++) {
        const x = cx + i * cw, y = cy + j * ch; if (x < 2 || x > W - 2) continue;
        // two samples per cell, averaged, for a smoother edge
        const u = (x - cx) / rs, v = (y - cy) / rs, du = cw / rs * .25, dv = ch / rs * .25;
        const I = (field(u - du, v - dv, t) + field(u + du, v + dv, t)) / 2;
        // fade toward the left so the art never crowds the price
        const fade = .35 + .65 * sm(cx - rs * 3.4, cx - rs * 1.9, x);
        const q = Math.pow(Math.min(1, I * fade), .8);
        if (q < .06) continue;
        cells.push(x, y, behindText(x, y) ? -q : q);
      }
      // coloured like the ASCII globes across the page: ink for the dense structure, brand blue in the mid-tones,
      // light blue for the faint glow, and a few blue sparkles that drift through the ink
      const tk = Math.floor(t * 1.4);
      for (let pass = 0; pass < 4; pass++) {
        ctx.fillStyle = pass === 0 ? C.accent2 : pass === 1 ? C.accent2 : pass === 2 ? C.accent : C.accentInk;
        for (let k = 0; k < cells.length; k += 3) {
          const qs = cells[k + 2], dim = qs < 0, q = Math.abs(qs), sp = !dim && q > .45 && hash(Math.round(cells[k] / cw) + tk * 7, Math.round(cells[k + 1] / ch) - tk * 3, 5) > .955;
          const p = sp ? 3 : q < .3 ? 0 : q < .58 ? 1 : 2; if (p !== pass) continue;
          ctx.globalAlpha = (pass === 0 ? .3 + q * .5 : pass === 1 ? .55 + q * .35 : pass === 2 ? .5 + q * .35 : .8) * (dim ? .22 : 1);
          ctx.fillText(BR[Math.max(1, Math.min(9, Math.round(q * 9)))], cells[k], cells[k + 1]);
        }
      }
      ctx.globalAlpha = 1;
    };
    onResize(cv, () => { BH = fit(cv); measureText(); seed(); draw(); });
    if (document.fonts) document.fonts.ready.then(() => { measureText(); draw(); });
    animate(card, dt => { bt += dt; draw(); });
  })();
