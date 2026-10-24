  // ================= HERO: how M-World works, in five steps =================
  // you bring the idea → AI runs the business → it hires people → it deals with other businesses → you keep the profit
  // kinds (for the How it works cards): ai = department does it; ppl = book a person; biz = order from one business; chain = business hands work to another
  const SPRINTS = [
    { name: 'Pet products', prompt: 'Build me a premium pet-products business.',
      story: { ai: ['MKT', 'Marketing is writing the launch emails.'], ppl: ['photographer', 'It books a photographer for the product shots.'],
               biz: [['supplier', 'packaging', 'payments'], 'It orders treats and branded packaging, and sets up card payments.'], profit: 'The first orders ship.' },
      tasks: [
      { k: 'ai', w: 'STR', t: 'Size the premium pet-treat market' },
      { k: 'ai', w: 'TEC', t: 'Build the storefront and checkout' },
      { k: 'chain', w: ['supplier', 'packaging'], t: 'Order treats and branded packaging' },
      { k: 'ppl', w: 'photographer', t: 'Book a photographer for product shots' },
      { k: 'biz', w: 'payments', t: 'Set up card payments' },
      { k: 'ai', w: 'MKT', t: 'Write the launch email sequence' },
      { k: 'chain', w: ['warehouse', 'courier'], t: 'Store stock and ship first orders' } ] },
    { name: 'Coffee subscription', prompt: 'Start a monthly single-origin coffee subscription.',
      story: { ai: ['TEC', 'Technology is building the subscription sign-up.'], ppl: ['designer', 'It briefs a designer for the bag labels.'],
               biz: [['roaster', 'packaging', 'courier'], 'It buys beans from a partner roaster and books a courier for delivery.'], profit: 'The first subscribers pay for month one.' },
      tasks: [
      { k: 'ai', w: 'STR', t: 'Pick a niche: home pour-over brewers' },
      { k: 'chain', w: ['roaster', 'packaging'], t: 'Source beans from a partner roaster' },
      { k: 'ai', w: 'TEC', t: 'Build the subscription signup flow' },
      { k: 'ppl', w: 'designer', t: 'Brief a designer for the bag labels' },
      { k: 'biz', w: 'payments', t: 'Set up recurring billing' },
      { k: 'ppl', w: 'accountant', t: 'Have an accountant check the tax setup' },
      { k: 'ai', w: 'SAL', t: 'Draft outreach to coffee creators' } ] },
    { name: 'Tutoring app', prompt: 'Launch a maths tutoring app for high-school students.',
      story: { ai: ['TEC', 'Technology is shipping the app.'], ppl: ['tutor', 'It recruits five maths tutors to teach.'],
               biz: [['print shop'], 'It orders flyers from a print shop for local schools.'], profit: 'The first families sign up.' },
      tasks: [
      { k: 'ai', w: 'STR', t: 'Map the syllabus and competitors' },
      { k: 'ai', w: 'TEC', t: 'Ship the mobile app beta' },
      { k: 'ppl', w: 'tutor', t: 'Recruit five maths tutors' },
      { k: 'ppl', w: 'lawyer', t: 'Have a lawyer review the parent terms' },
      { k: 'chain', w: ['print shop', 'ad studio'], t: 'Print flyers and plan school ads' },
      { k: 'ai', w: 'MKT', t: 'Write the app-store listing' } ] }
  ];
  const STEPS = [
    { title: 'You bring the idea', cap: () => fullAuto ? 'Describe it in one sentence, then approve the plan and the budget. After that it runs itself.' : 'Describe it in one sentence, then approve the plan, the budget and every big decision.' },
    { title: 'AI runs the business', cap: s => s.story.ai[1] + ' Six AI departments work on it around the clock.' },
    { title: 'People do the human work', cap: s => s.story.ppl[1] + ' Your business hires people only for work that needs a human.' },
    { title: 'It deals with other businesses', cap: s => s.story.biz[1] + ' Businesses on M-World are connected, so they can trade with each other directly.' },
    { title: 'You keep the profit', cap: s => s.story.profit + ' You own the business, so the profit goes to you.' }
  ];
  const eco = $('eco'), map = $('ecoMap'), wires = $('ecoWires'), sph = $('ecoSphere');
  const nYou = $('nYou'), nCore = $('nCore'), nPpl = $('nPpl'), nNet = $('nNet');
  const stepBtns = [...document.querySelectorAll('#ecoSteps button')];
  const promptEl = $('promptInput');
  const SVGNS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  // wires: idea (you → business), profit (business → you), hires (business → people), deals (business ↔ businesses)
  const W = {
    idea: { cls: '', label: 'idea' }, profit: { cls: '', label: 'profit' },
    hires: { cls: 'p', label: 'hires' }, deals: { cls: 'b', label: 'trades' }
  };
  for (const k in W) { W[k].path = mk('path', { class: 'w ' + W[k].cls }); W[k].text = mk('text', {}); W[k].text.textContent = W[k].label; W[k].dot = mk('circle', { r: 3.4, class: 'dot ' + W[k].cls, opacity: 0 }); wires.append(W[k].path, W[k].text, W[k].dot); }
  const ACTIVE = [['idea'], [], ['hires'], ['deals'], ['profit']];
  function layoutWires() {
    const o = map.getBoundingClientRect(), r = el => { const b = el.getBoundingClientRect(); return { l: b.left - o.left, r: b.right - o.left, t: b.top - o.top, b: b.bottom - o.top, cx: (b.left + b.right) / 2 - o.left }; };
    const y = r(nYou), c = r(nCore), p = r(nPpl), n = r(nNet), gap = 20;
    const line = (k, x0, y0, x1, y1, lx, ly, anchor) => {
      if (x0 !== x1) { const my = (y0 + y1) / 2, rr = Math.min(10, Math.abs(x1 - x0) / 2), s = x1 > x0 ? 1 : -1;
        W[k].path.setAttribute('d', `M${x0} ${y0} V${my - rr} Q${x0} ${my} ${x0 + s * rr} ${my} H${x1 - s * rr} Q${x1} ${my} ${x1} ${my + rr} V${y1}`); }
      else W[k].path.setAttribute('d', `M${x0} ${y0} V${y1}`);
      W[k].text.setAttribute('x', lx); W[k].text.setAttribute('y', ly); W[k].text.setAttribute('text-anchor', anchor);
    };
    const my = (y.b + c.t) / 2 + 4;
    line('idea', y.cx - gap, y.b, y.cx - gap, c.t, y.cx - gap - 10, my, 'end');
    line('profit', y.cx + gap, c.t, y.cx + gap, y.b, y.cx + gap + 10, my, 'start');
    const clampX = x => Math.max(c.l + 28, Math.min(c.r - 28, x)), lowY = (c.b + Math.min(p.t, n.t)) / 2 + 4;
    const px = clampX(p.cx), nx = clampX(n.cx);
    line('hires', px, c.b, p.cx, p.t, Math.min(px, p.cx) - 10, lowY, 'end');
    line('deals', nx, c.b, n.cx, n.t, Math.max(nx, n.cx) + 10, lowY, 'start');
    for (const k in W) W[k].len = W[k].path.getTotalLength();
  }
  let sIdx = 0, sprint = SPRINTS[0], step = 0, stepT = 0, stepDur = 4, time = 0, userTyped = false, typing = null, fullAuto = true, paused = false, glow = 0;
  function setChips(i) { document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === i))); }
  // the How it works cards follow the chosen example
  function syncHow() {
    $('howPrompt').textContent = sprint.prompt;
    const pick = k => sprint.tasks.find(t => k === 'biz' ? (t.k === 'biz' || t.k === 'chain') : t.k === k);
    const ai = sprint.tasks.filter(t => t.k === 'ai')[1] || pick('ai'), p = pick('ppl'), b = pick('biz');
    $('dAI').textContent = ai ? ai.t : ''; $('dPPL').textContent = p ? p.t : ''; $('dBIZ').textContent = b ? b.t : '';
  }
  function setStep(i) {
    step = i; stepT = time;
    stepDur = i === 0 ? (typing ? typing.text.length / typing.cps + 1.6 : 3.4) : 4.2;
    stepBtns.forEach((b, j) => { b.setAttribute('aria-pressed', String(j === i)); b.style.setProperty('--p', reduce ? 1 : 0); });
    const st = sprint.story;
    nYou.classList.toggle('on', i === 0 || i === 4);
    nCore.classList.toggle('on', i === 1);
    nPpl.classList.toggle('on', i === 2);
    nNet.classList.toggle('on', i === 3);
    nCore.querySelectorAll('.team li').forEach(li => li.classList.toggle('on', i === 1 && li.dataset.w === st.ai[0]));
    nPpl.querySelectorAll('li').forEach(li => li.classList.toggle('on', i === 2 && li.dataset.w === st.ppl[0]));
    nNet.querySelectorAll('li').forEach(li => li.classList.toggle('on', i === 3 && st.biz[0].includes(li.dataset.w)));
    for (const k in W) { const on = ACTIVE[i].includes(k); W[k].path.classList.toggle('on', on); W[k].text.classList.toggle('on', on); W[k].dot.setAttribute('opacity', 0); }
    if (i === 1) glow = 1;
    document.querySelector('#ecoCap .mt').textContent = STEPS[i].title + '.';
    $('ecoCapT').textContent = STEPS[i].cap(sprint);
    replay($('ecoCap'));
    drawSphere();
  }
  function loadSprint(i, instant) {
    sIdx = i % SPRINTS.length; sprint = SPRINTS[sIdx];
    $('ecoName').textContent = sprint.name; replay($('ecoName'));
    setChips(sIdx); syncHow();
    typing = null;
    if (!userTyped) {
      if (instant || reduce) promptEl.value = sprint.prompt;
      else { typing = { text: sprint.prompt, t0: time, cps: 34 }; promptEl.value = ''; }
    }
    setStep(0);
  }
  // the business at the centre: the brand's ASCII sphere, brighter while its AI team works
  let sctx = null, SW = 0;
  function sizeSphere() { const f = fit(sph); sctx = f.ctx; SW = f.W; drawSphere(); }
  function drawSphere() {
    if (!sctx) return;
    sctx.clearRect(0, 0, SW, SW);
    sphere(sctx, SW / 2, SW / 2, SW * .44, time, { res: 7, cellMin: 5, glow: step === 1 ? .6 + glow * .4 : glow * .4 });
  }
  function frame(dt) {
    time += dt; glow *= Math.pow(.3, dt);
    if (typing) {
      const k = Math.min(typing.text.length, Math.floor((time - typing.t0) * typing.cps));
      if (!userTyped && promptEl.value.length !== k) promptEl.value = typing.text.slice(0, k);
      if (k >= typing.text.length) typing = null;
    }
    const u = Math.min(1, (time - stepT) / stepDur);
    const btn = stepBtns[step]; btn.style.setProperty('--p', paused ? 1 : u.toFixed(3));
    // a dot travels the active wire
    for (const k of ACTIVE[step]) {
      const w = W[k]; if (!w.len) continue;
      const v = ((time - stepT) * .55) % 1, pt = w.path.getPointAtLength(w.len * v);
      w.dot.setAttribute('cx', pt.x); w.dot.setAttribute('cy', pt.y); w.dot.setAttribute('opacity', Math.min(1, v * 6, (1 - v) * 6));
    }
    drawSphere();
    if (paused) { stepT += dt; return; }
    if (u >= 1) step < STEPS.length - 1 ? setStep(step + 1) : loadSprint(sIdx + 1);
  }
  stepBtns.forEach(b => b.addEventListener('click', () => setStep(+b.dataset.s)));
  // hovering or focusing the diagram holds the current step so it can be read
  eco.addEventListener('pointerenter', () => { paused = true; });
  eco.addEventListener('pointerleave', () => { paused = false; });
  eco.addEventListener('focusin', () => { paused = true; });
  eco.addEventListener('focusout', e => { if (!eco.contains(e.relatedTarget)) paused = false; });
  promptEl.addEventListener('input', () => { userTyped = promptEl.value.trim().length > 0; typing = null; nudgeGlyph(); });
  let glyphT = 0; const glyph = document.querySelector('.prompt .glyph');
  function nudgeGlyph() { glyph.classList.add('tick'); clearTimeout(glyphT); glyphT = setTimeout(() => glyph.classList.remove('tick'), 140); }
  document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { userTyped = false; loadSprint(+c.dataset.i, true); }));
  const setMode = full => {
    fullAuto = full; $('modeFull').setAttribute('aria-pressed', String(full)); $('modeSemi').setAttribute('aria-pressed', String(!full));
    $('ecoYouSub').textContent = full ? 'Own it. Approve the plan once.' : 'Own it. Approve every big decision.';
    if (step === 0) $('ecoCapT').textContent = STEPS[0].cap(sprint);
  };
  $('modeFull').addEventListener('click', () => setMode(true));
  $('modeSemi').addEventListener('click', () => setMode(false));
  const showFiles = () => { const f = [...$('fileMedia').files, ...$('fileDocs').files]; $('fileNames').textContent = f.length ? (f.length === 1 ? f[0].name : f.length + ' files') : ''; replay($('fileNames')); };
  $('fileMedia').addEventListener('change', showFiles); $('fileDocs').addEventListener('change', showFiles);
  onResize(map, () => { layoutWires(); });
  onResize(sph, sizeSphere);
  loadSprint(0);
  if (document.fonts) document.fonts.ready.then(() => { layoutWires(); drawSphere(); });
  if (!reduce) animate(eco, frame);

