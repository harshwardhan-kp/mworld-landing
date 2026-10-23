  // ================= ISO MINIATURES: the three actor panels =================
  // Each panel is a small isometric world drawn in SVG: the tower (AI), the handoff (people), the district (businesses).
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; };
  const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const ez = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const c01 = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const isoP = (s, ox, oy) => (x, y, z = 0) => [ox + (x - y) * s * .866, oy + (x + y) * s * .5 - z * s];
  function hull(ps) {
    ps = ps.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of ps) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of ps.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function ibox(parent, P, cls) {
    const g = sv('g', { class: 'ibox ' + cls }, parent);
    const fl = sv('polygon', { class: 'fl' }, g), fr = sv('polygon', { class: 'fr' }, g), ft = sv('polygon', { class: 'ft' }, g);
    g.set = (x, y, z, w, d, h) => {
      fl.setAttribute('points', pts([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
      fr.setAttribute('points', pts([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]));
      ft.setAttribute('points', pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]));
      g.depth = x + w / 2 + y + d / 2;
    };
    return g;
  }
  function ishadow(parent, P, x, y, w, d, h) {
    const sx = h * .55, sy = -h * .14, c = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
    sv('polygon', { class: 'ishadow', points: pts(hull(c.concat(c.map(([a, b]) => [a + sx, b + sy])).map(([a, b]) => P(a, b, 0)))) }, parent);
  }
  function lattice(svg, P, n, id, cx, cy, rx, ry) {
    const defs = sv('defs', {}, svg);
    const rg = sv('radialGradient', { id: id + 'g', cx: cx, cy: cy, r: '0.62', gradientUnits: 'objectBoundingBox' }, defs);
    sv('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '1' }, rg);
    sv('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '0' }, rg);
    const m = sv('mask', { id: id + 'm', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 340, height: 250 }, defs);
    sv('rect', { x: 0, y: 0, width: 340, height: 250, fill: `url(#${id}g)` }, m);
    const g = sv('g', { class: 'lattice', mask: `url(#${id}m)` }, svg);
    for (let i = -n; i <= n; i++) {
      let a = P(i + rx, -n + ry), b = P(i + rx, n + ry); sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, g);
      a = P(-n + rx, i + ry); b = P(n + rx, i + ry); sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, g);
    }
  }
  function ringAt(parent, cls) { return sv('ellipse', { class: 'ring ' + cls, rx: 0, ry: 0, opacity: 0 }, parent); }
  function pulseRing(r, P, x, y, z, u, s) {
    if (u < 0 || u > 1) { r.setAttribute('opacity', 0); return; }
    const [X, Y] = P(x, y, z), k = ez(u);
    r.setAttribute('cx', X); r.setAttribute('cy', Y); r.setAttribute('rx', (.6 + k * 1.6) * s); r.setAttribute('ry', (.6 + k * 1.6) * s * .5); r.setAttribute('opacity', (1 - u) * .9);
  }
  function runIso(svg, frame, still) {
    let t = 0; frame(still);
    animate(svg, dt => { t += dt; frame(t); });
  }

  // ---- AI: the tower. Six glass floors; the working one slides out like a drawer and names its task.
  (function tower() {
    const svg = $('isoAI'), s = 17, P = isoP(s, 166, 168);
    lattice(svg, P, 7, 'la', .5, .62, 0, 0);
    const W = 4.8, x0 = -W / 2, y0 = -W / 2, GAP = .86, H = .56;
    const ground = sv('g', {}, svg); ishadow(ground, P, x0, y0, W, W, 5 * GAP + H);
    const world = sv('g', {}, svg);
    const F = [['STR', 'STRATEGY', 'Sizing the market'], ['MGT', 'MANAGEMENT', 'Planning the sprint'], ['TEC', 'TECHNOLOGY', 'Building the checkout'],
               ['FIN', 'FINANCE', 'Modelling margins'], ['MKT', 'MARKETING', 'Writing launch emails'], ['SAL', 'SALES', 'Finding 40 boutiques']];
    const floors = F.map((f, i) => { const g = ibox(world, P, 'slab'), t = sv('text', { class: 'face' }, g); t.textContent = f[0] + ' · ' + f[1]; return { g, t, i }; });
    const callG = sv('g', {}, svg), line = sv('polyline', { class: 'call' }, callG), dot = sv('circle', { class: 'call-dot', r: 2.4 }, callG);
    const ct = sv('text', { class: 'call-t' }, callG), cc = sv('tspan', {}, ct), cx_ = sv('tspan', { dx: 5 }, ct);
    const sparks = Array.from({ length: 9 }, (_, j) => { const e = sv('text', { class: 'spk' }, svg); e.textContent = '+*·:#+·*='[j]; return e; });
    const PER = 2.2;
    function frame(t) {
      const k = Math.floor(t / PER) % 6, u = (t % PER) / PER;
      const o = u < .22 ? ez(u / .22) : u > .82 ? ez((1 - u) / .18) : 1;
      floors.forEach(f => {
        const z = f.i * GAP, dy = f.i === k ? o * 1.35 : 0;
        f.g.set(x0, y0 + dy, z, W, W, H); f.g.classList.toggle('on', f.i === k && o > .35);
        const [X, Y] = P(x0 + .32, y0 + W + dy, z + .15); f.t.setAttribute('transform', `matrix(.866 .5 0 1 ${X.toFixed(1)} ${Y.toFixed(1)})`);
      });
      const z = k * GAP, a = P(x0 + W, y0 + W + o * 1.35, z + H * .5), ex = 334, ey = Math.min(236, a[1] + 28);
      line.setAttribute('points', pts([a, [a[0] + 18, ey], [ex, ey]])); dot.setAttribute('cx', a[0]); dot.setAttribute('cy', a[1]);
      ct.setAttribute('x', ex); ct.setAttribute('y', ey - 6); cc.textContent = F[k][0]; cx_.textContent = F[k][2];
      callG.setAttribute('opacity', c01((o - .3) / .5));
      sparks.forEach((e, j) => {
        const ph = ((t * .55 + j / sparks.length) % 1), sx = x0 + .6 + (j * 1.37 % 1) * (W - 1.2), sy = y0 + W + o * 1.35 - .35;
        const [X, Y] = P(sx, sy, z + H + ph * 2.2);
        e.setAttribute('x', X.toFixed(1)); e.setAttribute('y', Y.toFixed(1)); e.setAttribute('opacity', (o * Math.sin(Math.PI * ph) * .9).toFixed(2));
      });
    }
    runIso(svg, frame, PER * 4 + PER * .5);
  })();

  // ---- People: the handoff. A brief leaves your organisation, a person accepts it, does the job, and it comes back stamped.
  (function handoff() {
    const svg = $('isoPPL'), s = 15, P = isoP(s, 172, 126);
    lattice(svg, P, 8, 'lp', .5, .55, 0, 0);
    const ground = sv('g', {}, svg), world = sv('g', {}, svg), top = sv('g', {}, svg);
    const ORG = [-4.6, 1.6, 1.7, 1.7, 3.3];
    ishadow(ground, P, ...ORG.slice(0, 4), ORG[4]);
    const org = ibox(world, P, 'ink'); org.set(ORG[0], ORG[1], 0, ORG[2], ORG[3], ORG[4]);
    for (let k = 1; k <= 3; k++) { const a = P(ORG[0] + .3, ORG[1] + ORG[3], k * .85), b = P(ORG[0] + ORG[2] - .3, ORG[1] + ORG[3], k * .85); sv('line', { class: 'win', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, world); }
    const cap = ibox(world, P, 'cap'); cap.set(ORG[0] + .2, ORG[1] + .2, ORG[4], ORG[2] - .4, ORG[3] - .4, .14);
    const ol = sv('text', { class: 'lbl you' }, top); const op = P(ORG[0] + ORG[2] / 2, ORG[1] + ORG[3] / 2, ORG[4] + .2); ol.setAttribute('x', op[0]); ol.setAttribute('y', op[1] - 12); ol.textContent = 'your org';
    const ROLES = [['photographer', 1.55, -4.25], ['accountant', 6.9, 1.1], ['lawyer', 1.4, 4.2]];
    const people = ROLES.map(([name, x, y]) => {
      ishadow(ground, P, x - 1.15, y - 1.15, 2.3, 2.3, .22);
      const tile = ibox(world, P, 'tile'); tile.set(x - 1.15, y - 1.15, 0, 2.3, 2.3, .22);
      const [X, Y] = P(x, y, .22), g = sv('g', {}, world);
      sv('ellipse', { class: 'psh', cx: X + 2, cy: Y + 1, rx: 8, ry: 3.6 }, g);
      const body = sv('g', {}, g);
      sv('rect', { class: 'pb2', x: X - 5.6, y: Y - 17, width: 11.2, height: 17, rx: 5.6 }, body);
      sv('rect', { class: 'pb', x: X - 5.6, y: Y - 17, width: 7.4, height: 17, rx: 5.6 }, body);
      sv('circle', { class: 'ph', cx: X, cy: Y - 23, r: 5.2 }, body);
      const lb = sv('text', { class: 'lbl ppl', x: X, y: Y - 36 }, top); lb.textContent = name;
      return { name, x, y, tile, body, ring: ringAt(top, 'a') };
    });
    const card = sv('g', {}, top), sheet = sv('polygon', { class: 'card' }, card), l1 = sv('line', { class: 'card-l' }, card), l2 = sv('line', { class: 'card-l' }, card), chk = sv('text', { class: 'chk' }, card); chk.textContent = '✓';
    const tag = sv('g', { class: 'tag' }, top), tr = sv('rect', { rx: 6, height: 19 }, tag), tc = sv('circle', { r: 2.6 }, tag), tt = sv('text', {}, tag);
    const PER = 6.4;
    function placeCard(x, y, z, done) {
      const c = [[x - .55, y - .38], [x + .55, y - .38], [x + .55, y + .38], [x - .55, y + .38]].map(([a, b]) => P(a, b, z));
      sheet.setAttribute('points', pts(c));
      const m1 = P(x - .35, y - .1, z), m2 = P(x + .25, y - .1, z), m3 = P(x - .35, y + .12, z), m4 = P(x + .1, y + .12, z);
      l1.setAttribute('x1', m1[0]); l1.setAttribute('y1', m1[1]); l1.setAttribute('x2', m2[0]); l1.setAttribute('y2', m2[1]);
      l2.setAttribute('x1', m3[0]); l2.setAttribute('y1', m3[1]); l2.setAttribute('x2', m4[0]); l2.setAttribute('y2', m4[1]);
      const cp = P(x + .3, y + .05, z); chk.setAttribute('x', cp[0]); chk.setAttribute('y', cp[1] - 2); chk.setAttribute('opacity', done);
    }
    function frame(t) {
      const idx = Math.floor(t / PER) % 3, u = (t % PER) / PER, p = people[idx];
      const A = [ORG[0] + ORG[2] / 2, ORG[1] + ORG[3] / 2, ORG[4] + .5], B = [p.x + .15, p.y + 1.5, .3];
      let cxy, done = 0;
      if (u < .22) { const k = ez(u / .22); cxy = [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k) + Math.sin(Math.PI * k) * 2.6]; }
      else if (u < .62) { cxy = B; done = c01((u - .52) / .06); }
      else if (u < .84) { const k = ez((u - .62) / .22); cxy = [lerp(B[0], A[0], k), lerp(B[1], A[1], k), lerp(B[2], A[2], k) + Math.sin(Math.PI * k) * 2.6]; done = 1; }
      else cxy = A;
      placeCard(cxy[0], cxy[1], cxy[2], done);
      card.setAttribute('opacity', u > .86 ? c01((.94 - u) / .08) : 1);
      cap.classList.toggle('on', u > .82 && u < .97);
      people.forEach((q, i) => {
        const on = i === idx && u > .22 && u < .62;
        q.tile.classList.toggle('on', on);
        const bob = on && u > .32 ? Math.sin((u - .32) * 60) * 1.2 : 0;
        q.body.setAttribute('transform', `translate(0 ${bob.toFixed(2)})`);
        pulseRing(q.ring, P, q.x, q.y, .22, i === idx ? (u - .22) / .2 : -1, s);
      });
      const label = u < .22 ? 'Brief sent' : u < .32 ? 'Booked' : u < .52 ? 'On the job' : u < .84 ? 'Delivered' : 'Back in the plan';
      tt.textContent = p.name + ' · ' + label;
      const w = Math.max(150, (tt.getComputedTextLength ? tt.getComputedTextLength() : 150) + 26), tx = 12, ty = 222;
      tr.setAttribute('x', tx); tr.setAttribute('y', ty); tr.setAttribute('width', w);
      tc.setAttribute('cx', tx + 10); tc.setAttribute('cy', ty + 9.5); tt.setAttribute('x', tx + w / 2 + 6); tt.setAttribute('y', ty + 13);
      tag.setAttribute('opacity', u < .04 ? u / .04 : 1);
    }
    runIso(svg, frame, PER * .4);
  })();

  // ---- Businesses: the district. Parcels move supplier → packaging → courier → your org; another M-World org ships in too.
  (function district() {
    const svg = $('isoBIZ'), s = 14, P = isoP(s, 150, 108);
    lattice(svg, P, 9, 'lb', .5, .55, 1.5, 1);
    const ground = sv('g', {}, svg), roads = sv('g', {}, svg), world = sv('g', {}, svg), top = sv('g', {}, svg);
    const B = {
      you:      { x: 0,    y: 0,    w: 2.2, d: 2.2, h: 4.6, cls: 'ink',  label: 'your org', lc: 'you' },
      supplier: { x: 4.6,  y: -3.4, w: 2.2, d: 1.7, h: 2.3, cls: 'bld',  label: 'supplier' },
      packaging:{ x: 5.6,  y: 1.4,  w: 2.6, d: 1.7, h: 1.3, cls: 'bld',  label: 'packaging' },
      courier:  { x: 2.6,  y: 4.6,  w: 2.2, d: 1.7, h: 1.7, cls: 'bld',  label: 'courier' },
      other:    { x: -4.2, y: 3.0,  w: 1.9, d: 1.9, h: 3.2, cls: 'blue', label: 'another org', lc: 'org' },
      pay:      { x: -5.8, y: -1.9, w: 1.5, d: 1.4, h: 1.2, cls: 'bld',  label: 'payments' }
    };
    // a few unnamed low blocks give the district its texture
    const filler = [[8.6, -1.6, 1.1, 1.1, .6], [6.6, 4.8, 1.2, 1.2, .5]];
    const road = (pp) => { const d = 'M' + pp.map(([x, y]) => P(x, y, 0).map(v => v.toFixed(1)).join(' ')).join(' L'); sv('path', { class: 'road', d }, roads); sv('path', { class: 'road-c', d }, roads); };
    const R = {
      sp: [[5.7, -1.5], [5.7, .6], [6.9, .6], [6.9, 1.2]],
      pc: [[6.9, 1.2], [6.9, .6], [3.6, .6], [3.6, 4.4]],
      cy: [[3.6, 4.4], [3.6, 2.9], [1.1, 2.9], [1.1, 2.3]],
      oy: [[-2.1, 3.9], [-.7, 3.9], [-.7, 2.9], [.5, 2.9], [.5, 2.3]],
      py: [[-4.3, -1.2], [-2.6, -1.2], [-2.6, 1.1], [-.2, 1.1]]
    };
    Object.values(R).forEach(road);
    for (const k in B) { const b = B[k]; ishadow(ground, P, b.x, b.y, b.w, b.d, b.h); b.g = ibox(world, P, b.cls); b.g.set(b.x, b.y, 0, b.w, b.d, b.h); }
    filler.forEach(([x, y, w, d, h]) => { ishadow(ground, P, x, y, w, d, h); const g = ibox(world, P, 'bld'); g.set(x, y, 0, w, d, h); g.style.opacity = .55; });
    const winOn = (b, n, cls) => { for (let k = 1; k <= n; k++) { const z = k * b.h / (n + 1), a = P(b.x + .3, b.y + b.d, z), c = P(b.x + b.w - .3, b.y + b.d, z); sv('line', { class: 'win ' + cls, x1: a[0], y1: a[1], x2: c[0], y2: c[1] }, b.g); } };
    winOn(B.you, 4, ''); winOn(B.other, 3, 'w');
    const door = (b, x1, x2, h) => sv('polygon', { class: 'door', points: pts([P(b.x + x1, b.y + b.d, 0), P(b.x + x2, b.y + b.d, 0), P(b.x + x2, b.y + b.d, h), P(b.x + x1, b.y + b.d, h)]) }, b.g);
    door(B.courier, .5, 1.6, 1.05); door(B.packaging, .9, 1.9, .8); door(B.supplier, .6, 1.4, .9);
    const cap = ibox(world, P, 'cap'); cap.set(B.you.x + .25, B.you.y + .25, B.you.h, B.you.w - .5, B.you.d - .5, .14); cap.depth = B.you.g.depth + .01;
    for (const k in B) { const b = B[k], [X, Y] = P(b.x + b.w / 2, b.y + b.d / 2, b.h); const t = sv('text', { class: 'lbl ' + (b.lc || ''), x: X, y: Y - 10 }, top); t.textContent = b.label; }
    const trips = [
      { r: R.sp, start: 0,   dur: 1.7, cls: '',      size: .5,  to: 'packaging', txt: ['supplier', 'packaging'] },
      { r: R.pc, start: 2.3, dur: 2.5, cls: 'boxed', size: .62, to: 'courier',   txt: ['packaging', 'courier'] },
      { r: R.cy, start: 5.2, dur: 1.8, cls: 'boxed', size: .62, to: 'you',       txt: ['courier', 'your org'] },
      { r: R.oy, start: 1.0, dur: 2.6, cls: 'bp',    size: .55, to: 'you',       txt: ['another org', 'your org'] },
      { r: R.py, start: 6.0, dur: 1.6, cls: '',      size: .4,  to: 'you',       txt: ['payments', 'your org'] }
    ];
    trips.forEach(tp => {
      tp.g = ibox(world, P, 'parcel ' + tp.cls); tp.ring = ringAt(top, tp.cls === 'bp' ? 'b' : 'k');
      tp.len = [0]; for (let i = 1; i < tp.r.length; i++) tp.len.push(tp.len[i - 1] + Math.hypot(tp.r[i][0] - tp.r[i - 1][0], tp.r[i][1] - tp.r[i - 1][1]));
    });
    const capT = sv('text', { class: 'cap-t', x: 12, y: 238 }, svg), c1 = sv('tspan', {}, capT), c2 = sv('tspan', { dx: 4 }, capT); c2.style.fill = 'var(--muted)';
    const PER = 8.2, kids = () => [...world.children];
    function at(tp, k) {
      const L = tp.len[tp.len.length - 1] * k; let i = 1; while (i < tp.len.length - 1 && tp.len[i] < L) i++;
      const a = tp.r[i - 1], b = tp.r[i], seg = tp.len[i] - tp.len[i - 1] || 1, f = (L - tp.len[i - 1]) / seg;
      return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
    }
    function frame(t) {
      const u = t % PER; let latest = null, arriving = false;
      trips.forEach(tp => {
        const k = (u - tp.start) / tp.dur;
        if (k >= 0 && k <= 1) {
          const [x, y] = at(tp, ez(k)), h = tp.size;
          tp.g.style.display = ''; tp.g.set(x - h / 2, y - h / 2, .02 + Math.abs(Math.sin(k * Math.PI * 6)) * .05, h, h, h * .85);
          if (!latest || tp.start > latest.start) latest = tp;
        } else tp.g.style.display = 'none';
        const end = tp.r[tp.r.length - 1], rk = (u - tp.start - tp.dur) / .9;
        pulseRing(tp.ring, P, end[0], end[1], 0, rk, s);
        if (tp.to === 'you' && rk >= 0 && rk <= 1) arriving = true;
      });
      cap.classList.toggle('on', arriving);
      // painter's order: sort the world by depth so parcels pass in front of and behind buildings correctly
      const ord = kids().filter(n => n.depth != null).sort((a, b) => a.depth - b.depth);
      ord.forEach(n => world.appendChild(n));
      if (latest) { c1.textContent = latest.txt[0] + ' → ' + latest.txt[1]; c2.textContent = latest.cls === 'bp' ? '· M-World to M-World' : '· business to business'; }
    }
    runIso(svg, frame, 3.2);
  })();
