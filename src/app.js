  // ================= THE APP: the whole business, run from one place =================
  // One example business (Tail & Co., premium pet treats) in five views: Board, Plan, Workflows, Money, People.
  // Work never runs out: agents keep adding tasks, requests queue up for the owner, and the owner can
  // approve, decline, drag, add and ask. Colours carry the three actors as on the rest of the page.
  const app = $('app');
  if (app) {
    const view = $('apView'), toolsEl = $('apTools'), drawer = $('apDrawer'), drawerIn = $('apDrawerIn'), toastsEl = $('apToasts');
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const usd = n => (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
    const make = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const clock = (() => { let m = 10 * 60 + 6; return () => { m += 3 + Math.floor(Math.random() * 6); return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }; })();

    // ---------- the team: six AI departments, three people it hired, the businesses it works with ----------
    const TEAM = {
      mira: { n: 'Mira', r: 'Management', k: 'ai', s: 'Planning sprint 3', a: 'Mi' },
      theo: { n: 'Theo', r: 'Strategy', k: 'ai', s: 'Testing a monthly treat box', a: 'Th' },
      kai: { n: 'Kai', r: 'Technology', k: 'ai', s: 'Fixing mobile checkout', a: 'Ka' },
      ada: { n: 'Ada', r: 'Finance', k: 'ai', s: 'Watching stock and cash', a: 'Ad' },
      juno: { n: 'Juno', r: 'Marketing', k: 'ai', s: 'Drafting the launch ads', a: 'Ju' },
      ravi: { n: 'Ravi', r: 'Sales', k: 'ai', s: 'Talking to three partners', a: 'Ra' },
      ananya: { n: 'Ananya Rao', r: 'Photographer', k: 'ppl', s: 'Booked for Thursday, 10:00', a: 'AR' },
      sara: { n: 'Sara Iyer', r: 'Customer support', k: 'ppl', s: 'Part-time, 4 hours a day', a: 'SI' },
      dev: { n: 'Dev Mehta', r: 'Accountant', k: 'ppl', s: 'Monthly tax filing', a: 'DM' },
      hound: { n: 'Happy Hound Foods', r: 'Supplier', k: 'biz', a: 'HH' },
      paws: { n: 'Paws & Co.', r: 'Packaging', k: 'biz', a: 'P&' },
      swift: { n: 'Swift Courier', r: 'Delivery', k: 'biz', a: 'SC' },
      pay: { n: 'Payments partner', r: 'Payments', k: 'biz', a: '$' },
      cust: { n: 'Customer', r: '', k: 'cust', a: 'C' },
      you: { n: 'You', r: 'Owner', k: 'cust', a: 'You' },
      mw: { n: 'M-World plan', r: 'Fully-Autonomous', k: 'ai', a: 'M' }
    };
    const av = (key, cls) => { const p = TEAM[key]; return `<span class="ap-av ${p.k}${cls ? ' ' + cls : ''}" aria-hidden="true">${esc(p.a)}</span>`; };
    const nameOf = key => TEAM[key].n;
    const roleOf = key => TEAM[key].r ? nameOf(key) + ' · ' + TEAM[key].r : nameOf(key);

    function toast(key, html) {
      const t = make('div', 'ap-toast', av(key) + '<span>' + html + '</span>');
      toastsEl.appendChild(t);
      while (toastsEl.children.length > 3) toastsEl.firstChild.remove();
      setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3800);
    }

    // ---------- mode: Fully-Autonomous runs on its own; Semi asks before anything starts ----------
    let fullAuto = true;
    function setAppMode(full, quiet) {
      fullAuto = full;
      $('apMode').setAttribute('aria-pressed', String(full));
      $('apModeT').textContent = full ? 'Fully-Autonomous' : 'Semi-Autonomous';
      if (!quiet) toast('mira', full ? 'Fully-Autonomous: I’ll only ask about spending and anything you sign.' : 'Semi-Autonomous: I’ll ask before each task starts.');
    }
    $('apMode').addEventListener('click', () => setAppMode(!fullAuto));
    document.addEventListener('mw:mode', e => setAppMode(e.detail, true));

    // ================= BOARD =================
    const POOL = [
      { t: 'Write descriptions for 12 new treats', w: 'juno', from: 'mira' },
      { t: 'Restock duck jerky', w: 'hound', from: 'ada', ask: 'Order <b>400 packs</b> from Happy Hound Foods for <b>$520</b>.', ok: 'Approve order', done: 'Order placed. 400 packs arrive Monday.' },
      { t: 'Pitch 20 pet stores in Pune', w: 'ravi', from: 'theo' },
      { t: 'Send the October newsletter', w: 'juno', from: 'mira', ask: 'Send the newsletter to <b>2,140 subscribers</b> tonight.', ok: 'Approve send', done: 'Sent. I’ll report opens tomorrow.' },
      { t: 'Ship 46 orders', w: 'swift', from: 'mira' },
      { t: 'File the monthly tax return', w: 'dev', from: 'ada', ask: 'Sign the return Dev prepared. <b>$84</b> is due.', ok: 'Sign', done: 'Signed and filed. Thank you.' },
      { t: 'Build the referral page', w: 'kai', from: 'theo' },
      { t: 'Reconcile week 3 payments', w: 'ada', from: 'mira' },
      { t: 'Order 600 branded boxes', w: 'paws', from: 'ada', ask: 'Order <b>600 boxes</b> from Paws &amp; Co. for <b>$240</b>.', ok: 'Approve order', done: 'Boxes ordered. Delivery on Friday.' },
      { t: 'Test a monthly treat box with 30 customers', w: 'theo', from: 'theo' },
      { t: 'Reply to 22 product reviews', w: 'sara', from: 'mira' },
      { t: 'Hire a weekend packer', w: 'mira', from: 'mira', ask: 'Hire a packer for weekends at <b>$12 an hour</b>.', ok: 'Approve hire', done: 'Posted the role. Interviews on Saturday.' },
      { t: 'Plan sprint 3', w: 'mira', from: 'mira' },
      { t: 'Shoot lifestyle photos with two dogs', w: 'ananya', from: 'juno' },
      { t: 'Set up a festive gift pack', w: 'theo', from: 'ravi' },
      { t: 'Speed up the product pages', w: 'kai', from: 'kai' }
    ];
    let seq = 0, poolAt = 0, doneMore = 11, filter = 'all', bAcc = 0, dragId = null;
    const T = [];
    const task = (o, col, p) => { const t = { id: 't' + (++seq), p: p || 0, sp: .14 + Math.random() * .12, col, approved: false, fresh: 0, ...o }; T.push(t); return t; };
    // the week so far
    task({ t: 'Shoot the chicken-jerky range', w: 'ananya', from: 'mira' }, 'doing', .45);
    task({ t: 'Fix checkout on mobile Safari', w: 'kai', from: 'kai' }, 'doing', .7);
    task({ t: 'Answer 18 customer questions', w: 'sara', from: 'mira' }, 'doing', .2);
    task({ t: 'Run Instagram ads for the launch', w: 'juno', from: 'theo', ask: 'Spend <b>$150</b> on Instagram ads over 7 days.', ok: 'Approve spend', done: 'Approved. The ads go live at 6 pm.' }, 'you', 1);
    task({ t: 'Book a stall at the Sunday pet fair', w: 'ravi', from: 'theo', ask: 'Pay <b>$45</b> for a stall at the Baner pet fair on Sunday.', ok: 'Approve', done: 'Stall booked. Sara will run it with me.' }, 'you', 1);
    POOL.slice(0, 3).forEach(o => task(o, 'todo')); poolAt = 3;
    ['Build the storefront and checkout|kai', 'Set up card payments|pay', 'Book a photographer|mira', 'Size the pet-treat market|theo'].forEach(s => { const [t, w] = s.split('|'); task({ t, w, from: 'mira' }, 'done', 1); });
    const inCol = c => T.filter(t => t.col === c);
    const kindOf = t => TEAM[t.w].k;

    function spawn(o, fromUser) {
      const t = task(o, 'todo'); t.fresh = 3;
      T.splice(T.indexOf(t), 1); T.unshift(t); // newest at the top of To do
      if (fromUser) t.fresh = 2;
      return t;
    }
    function needsCount() { const n = inCol('you').length, b = $('apNavNeeds'); b.textContent = n; b.classList.toggle('zero', !n); return n; }
    function toYou(t, msg) { t.col = 'you'; t.p = 1; toast(t.w, msg || `${esc(nameOf(t.w))} needs your OK: ${esc(t.t)}`); }
    function startTask(t) {
      if (!fullAuto && !t.approved && !t.ask) { t.ask = `${nameOf(t.w)} is ready to start. Go ahead?`; t.ok = 'Go ahead'; t.semi = true; toYou(t, `${esc(nameOf(t.w))} is ready to start: ${esc(t.t)}`); return; }
      t.col = 'doing'; t.p = Math.max(t.p, .08);
    }
    function finish(t) { t.col = 'done'; t.p = 1; T.splice(T.indexOf(t), 1); T.push(t); }
    function approve(t) {
      if (t.col !== 'you') return;
      t.approved = true; t.col = 'doing'; t.p = t.semi ? .1 : .6;
      toast(t.w, t.done || 'On it.'); needsCount(); syncBoard();
    }
    function decline(t) {
      T.splice(T.indexOf(t), 1);
      toast(t.from, `${nameOf(t.from)} will suggest something else.`);
      needsCount(); syncBoard();
    }
    function beat() {
      for (const t of T) if (t.fresh) t.fresh--;
      const doing = inCol('doing');
      for (const t of doing) {
        t.p = Math.min(1, t.p + t.sp);
        if (t.p < 1) continue;
        if (t.ask && !t.approved) { if (inCol('you').length < 4) toYou(t); else t.p = .96; }
        else { finish(t); if (Math.random() < .5) toast(t.w, `${esc(nameOf(t.w))} finished: ${esc(t.t)}`); }
      }
      if (inCol('doing').length < 3) { const n = inCol('todo')[0]; if (n) startTask(n); }
      if (inCol('todo').length < 3) { const o = POOL[poolAt++ % POOL.length]; spawn({ ...o }); }
      // the Done column keeps the latest four; the rest are counted
      const done = inCol('done');
      while (done.length > 4) { const old = done.shift(); T.splice(T.indexOf(old), 1); doneMore++; }
      needsCount();
      if (tab === 'board') syncBoard();
    }

    // board view: columns stay put, cards slide between them
    const COLS = [['todo', 'To do'], ['doing', 'In progress'], ['you', 'Needs you'], ['done', 'Done']];
    const cardEls = new Map();
    function cardHTML(t) {
      const who = `${av(t.w)}<span class="ap-cw">${esc(nameOf(t.w))}</span>`;
      const st = t.col === 'todo' ? 'Queued' : t.col === 'doing' ? Math.round(t.p * 100) + '%' : t.col === 'you' ? 'Waiting for you' : 'Done';
      return (t.fresh && t.col === 'todo' ? '<span class="ap-new">New</span>' : '') +
        `<span class="ap-ct">${esc(t.t)}</span>` +
        (t.fresh && t.col === 'todo' ? `<span class="ap-from">${t.from === 'you' ? 'Added by you' : 'Added by ' + esc(nameOf(t.from))}</span>` : '') +
        `<span class="ap-cm">${who}<span class="ap-cs">${st}</span></span>` +
        `<span class="ap-bar"><i style="width:${Math.round(t.p * 100)}%"></i></span>` +
        (t.col === 'you' ? `<div class="ap-ask"><p>${t.ask}</p><div class="row2"><button type="button" class="ap-btn pri" data-act="ok">${esc(t.ok || 'Approve')}</button><button type="button" class="ap-btn" data-act="no">Decline</button></div></div>` : '');
    }
    function paintCard(li, t) {
      li.className = 'ap-card ' + kindOf(t) + (t.fresh && t.col === 'todo' ? ' isnew' : '') + (filter !== 'all' && kindOf(t) !== filter ? ' hide' : '');
      li.draggable = t.col === 'todo';
      const key = [t.col, Math.round(t.p * 100), t.fresh > 0, t.ask].join('|');
      if (li.dataset.k === key) return;
      // keep the bar's width transition: update in place when only progress changed
      const bar = li.querySelector('.ap-bar i');
      if (bar && li.dataset.col === t.col && t.col === 'doing' && (li.dataset.fresh === String(t.fresh > 0))) {
        bar.style.width = Math.round(t.p * 100) + '%'; li.querySelector('.ap-cs').textContent = Math.round(t.p * 100) + '%';
      } else li.innerHTML = cardHTML(t);
      li.dataset.k = key; li.dataset.col = t.col; li.dataset.fresh = String(t.fresh > 0);
    }
    function syncBoard() {
      const cols = view.querySelector('.ap-cols'); if (!cols) return;
      const before = new Map([...cardEls].map(([id, li]) => [id, li.isConnected ? li.getBoundingClientRect() : null]));
      const live = new Set(T.map(t => t.id));
      for (const [id, li] of cardEls) if (!live.has(id)) { li.remove(); cardEls.delete(id); }
      for (const [c] of COLS) {
        const list = cols.querySelector(`.ap-col[data-c="${c}"] .ap-list`), items = inCol(c);
        items.forEach((t, i) => {
          let li = cardEls.get(t.id);
          if (!li) { li = make('li'); li.dataset.id = t.id; cardEls.set(t.id, li); }
          paintCard(li, t);
          if (list.children[i] !== li) list.insertBefore(li, list.children[i] || null);
        });
        const col = cols.querySelector(`.ap-col[data-c="${c}"]`);
        col.querySelector('.n').textContent = items.length;
        const empty = col.querySelector('.ap-empty'); if (empty) empty.hidden = !!items.length;
      }
      const more = cols.querySelector('.ap-more'); if (more) more.textContent = `+ ${doneMore} more this week`;
      if (reduce) return;
      for (const [id, li] of cardEls) {
        const a = before.get(id), b = li.getBoundingClientRect();
        if (!a) { li.animate([{ opacity: 0, transform: 'translateY(-6px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }); continue; }
        const dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) > .5 || Math.abs(dy) > .5) li.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    }
    function boardTools() {
      toolsEl.innerHTML = `<div class="ap-seg" role="group" aria-label="Show">
          <button type="button" data-f="all" aria-pressed="${filter === 'all'}">All</button>
          <button type="button" data-f="ai" aria-pressed="${filter === 'ai'}"><i></i>AI</button>
          <button type="button" data-f="ppl" aria-pressed="${filter === 'ppl'}"><i class="ppl"></i>People</button>
          <button type="button" data-f="biz" aria-pressed="${filter === 'biz'}"><i class="biz"></i>Businesses</button></div>
        <form class="ap-add" id="apAdd"><label class="sr" for="apAddIn">Add a task</label><input id="apAddIn" placeholder="Add a task…" autocomplete="off"><button type="submit" aria-label="Add task">+</button></form>`;
      toolsEl.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
        filter = b.dataset.f; toolsEl.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        for (const t of T) { const li = cardEls.get(t.id); if (li) li.classList.toggle('hide', filter !== 'all' && kindOf(t) !== filter); }
      }));
      $('apAdd').addEventListener('submit', e => {
        e.preventDefault(); const v = $('apAddIn').value.trim(); if (!v) return;
        const w = route(v); spawn({ t: v.charAt(0).toUpperCase() + v.slice(1), w, from: 'you' }, true);
        $('apAddIn').value = ''; toast('mira', `Added. ${esc(nameOf(w))} will take it.`); needsCount(); syncBoard();
      });
    }
    // Mira routes a new task to whoever fits it
    function route(v) {
      const s = v.toLowerCase(), has = (...w) => w.some(x => s.includes(x));
      if (has('photo', 'shoot', 'picture')) return 'ananya';
      if (has('tax', 'gst', 'invoice', 'account')) return 'dev';
      if (has('reply', 'support', 'question', 'review', 'complain')) return 'sara';
      if (has('ship', 'deliver', 'courier')) return 'swift';
      if (has('box', 'packag')) return 'paws';
      if (has('stock', 'supplier', 'restock')) return 'hound';
      if (has('site', 'page', 'app', 'checkout', 'website', 'landing', 'bug', 'fix')) return 'kai';
      if (has('price', 'budget', 'cost', 'cash', 'profit', 'money')) return 'ada';
      if (has('email', 'ad', 'post', 'instagram', 'newsletter', 'brand', 'content', 'market')) return 'juno';
      if (has('sell', 'store', 'lead', 'pitch', 'customer', 'partner', 'deal')) return 'ravi';
      if (has('test', 'research', 'idea', 'plan', 'strategy')) return 'theo';
      return 'mira';
    }
    function renderBoard() {
      boardTools();
      const cols = make('div', 'ap-cols');
      cols.innerHTML = COLS.map(([c, n]) => `<div class="ap-col" data-c="${c}"><div class="ap-colh">${n} <span class="n">0</span></div><div><ol class="ap-list"></ol>${c === 'you' ? '<p class="ap-empty">Nothing waiting for you</p>' : ''}${c === 'done' ? '<p class="ap-more"></p>' : ''}</div></div>`).join('');
      view.appendChild(cols);
      cardEls.clear();
      syncBoard();
      cols.addEventListener('click', e => {
        const li = e.target.closest('.ap-card'); if (!li) return;
        const t = T.find(x => x.id === li.dataset.id); if (!t) return;
        const act = e.target.closest('[data-act]');
        if (act) { act.dataset.act === 'ok' ? approve(t) : decline(t); return; }
        openTask(t);
      });
      // drag a queued task into In progress to start it now
      cols.addEventListener('dragstart', e => { const li = e.target.closest('.ap-card'); if (!li) return; dragId = li.dataset.id; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); });
      cols.addEventListener('dragend', e => { const li = e.target.closest('.ap-card'); if (li) li.classList.remove('dragging'); dragId = null; cols.querySelectorAll('.drop').forEach(c => c.classList.remove('drop')); });
      const target = e => { const c = e.target.closest('.ap-col'); return c && c.dataset.c === 'doing' ? c : null; };
      cols.addEventListener('dragover', e => { const c = target(e); if (!c || !dragId) return; e.preventDefault(); c.classList.add('drop'); });
      cols.addEventListener('dragleave', e => { const c = target(e); if (c && !c.contains(e.relatedTarget)) c.classList.remove('drop'); });
      cols.addEventListener('drop', e => {
        const c = target(e); if (!c) return; e.preventDefault(); c.classList.remove('drop');
        const t = T.find(x => x.id === dragId); if (!t || t.col !== 'todo') return;
        t.fresh = 0; startTask(t);
        if (t.col === 'doing') { T.splice(T.indexOf(t), 1); T.unshift(t); toast(t.w, `${esc(nameOf(t.w))} started it now.`); }
        needsCount(); syncBoard();
      });
    }
    // a task, opened
    function openTask(t) {
      const pct = Math.round(t.p * 100), steps = ['Plan the work', 'Do the work', 'Check the result', 'Report back'];
      const at = t.col === 'done' ? 4 : t.col === 'todo' ? 0 : Math.min(3, Math.floor(t.p * 4));
      const pill = t.col === 'todo' ? '<span class="ap-pill quiet">Queued</span>' : t.col === 'doing' ? `<span class="ap-pill blue">In progress · ${pct}%</span>` : t.col === 'you' ? '<span class="ap-pill amber">Waiting for you</span>' : '<span class="ap-pill ink">Done</span>';
      drawerIn.innerHTML = `<div class="ap-dh">${av(t.w, 'lg')}<h4>${esc(t.t)}</h4><button type="button" class="ap-x" aria-label="Close">✕</button></div>
        <dl class="ap-dl"><dt>Who</dt><dd>${esc(roleOf(t.w))}</dd><dt>Status</dt><dd>${pill}</dd><dt>Added by</dt><dd>${t.from === 'you' ? 'You' : esc(roleOf(t.from))}</dd></dl>
        ${t.col === 'you' ? `<div class="ap-ask"><p>${t.ask}</p><div class="row2"><button type="button" class="ap-btn pri" data-act="ok">${esc(t.ok || 'Approve')}</button><button type="button" class="ap-btn" data-act="no">Decline</button></div></div>` : ''}
        <div><p class="ap-sh">Steps</p><ol class="ap-steps">${steps.map((s, i) => `<li class="${i < at ? 'ok' : i === at && t.col !== 'todo' ? 'now' : ''}">${s}</li>`).join('')}</ol></div>
        <div><p class="ap-sh">Activity</p><ul class="ap-log"><li><time>09:12</time><span>${t.from === 'you' ? 'You added this' : esc(nameOf(t.from)) + ' added this to the plan'}</span></li>${t.col !== 'todo' ? `<li><time>09:40</time><span>${esc(nameOf(t.w))} started</span></li>` : ''}${t.col === 'you' ? `<li><time>now</time><span>Waiting for your OK</span></li>` : ''}${t.col === 'done' ? `<li><time>11:05</time><span>Finished and reported back</span></li>` : ''}</ul></div>`;
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
      drawerIn.querySelector('.ap-x').focus({ preventScroll: true });
      drawerIn.querySelector('.ap-x').addEventListener('click', closeDrawer);
      drawerIn.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => { b.dataset.act === 'ok' ? approve(t) : decline(t); closeDrawer(); }));
    }
    function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
    app.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

    // ================= PLAN: partners, on M-World and off it =================
    const DEALS = [
      { id: 'barkbox', n: 'Bark Box Club', what: 'Would buy from you', on: true, st: 'new', p: 'Wants your duck jerky in its monthly box for 1,200 members.', terms: ['$3.20 a pack', '1,200 packs a month'], counter: '$3.60 a pack' },
      { id: 'paws', n: 'Paws & Co.', what: 'Packaging', on: true, st: 'new', p: 'Offers to make your branded boxes.', terms: ['$0.40 a box', '2-week trial'], counter: '$0.34 a box' },
      { id: 'lens', n: 'Pet Lens Studio', what: 'Photography', on: true, st: 'talk', p: 'Product photos for the new range.', terms: ['$60 a shoot', '4 shoots a month'], msg: 'They asked for $70 a shoot. I offered $60 for four shoots a month.' },
      { id: 'hound', n: 'Happy Hound Foods', what: 'Supplier', on: true, st: 'active', p: 'Duck and chicken treats at wholesale prices.', terms: ['30-day payment terms', 'Since 2 Oct'] },
      { id: 'swift', n: 'Swift Courier', what: 'Delivery', on: false, st: 'active', p: 'Same-day delivery across Pune.', terms: ['$2.10 an order', 'Not on M-World'] },
      { id: 'clinic', n: 'Riverside Pet Clinic', what: 'Would stock you', on: false, st: 'new', p: 'Would sell your treats at its front desk.', terms: ['15% margin', 'Pune'], counter: '12% margin' }
    ];
    const MORE_DEALS = [
      { id: 'bakery', n: 'Woof Bakery', what: 'Would buy from you', on: true, st: 'new', p: 'Wants a co-branded birthday treat pack.', terms: ['$4.10 a pack', 'From December'], counter: '$4.50 a pack' },
      { id: 'groom', n: 'Fluff Grooming', what: 'Would stock you', on: true, st: 'new', p: 'Would hand out your trial packs after each groom.', terms: ['300 trial packs a month', '$0.90 a pack'], counter: '$1.10 a pack' }
    ];
    let selDeal = 'barkbox', moreAt = 0, packetT = 0;
    const STATUS = { new: ['New proposal', 'blue'], talk: ['Negotiating', 'amber'], active: ['Active', 'ink'] };
    const POS = [[92, 64], [312, 62], [318, 206], [206, 292], [86, 228], [200, 30], [96, 300], [300, 296]];
    function mapSVG() {
      const cx = 200, cy = 168;
      const nodes = DEALS.map((d, i) => ({ d, x: POS[i % POS.length][0], y: POS[i % POS.length][1] }));
      const lines = nodes.map(({ d, x, y }) => `<path class="ln ${d.st === 'active' ? 'active' : d.st === 'talk' ? 'talk' : ''}${d.id === selDeal ? ' sel' : ''}" data-id="${d.id}" d="M${cx} ${cy} Q${(cx + x) / 2 + (y - cy) * .12} ${(cy + y) / 2 - (x - cx) * .12} ${x} ${y}"/>`).join('');
      const boxes = nodes.map(({ d, x, y }) => { const w = d.n.length * 6.4 + 22; return `<g class="nd ${d.st === 'active' ? 'active' : d.st === 'talk' ? 'talk' : ''}${d.id === selDeal ? ' sel' : ''}" data-id="${d.id}" style="cursor:pointer"><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13"/><text x="${x}" y="${y + 4}" text-anchor="middle">${esc(d.n)}</text></g>`; }).join('');
      return `<svg viewBox="0 0 400 330" role="img" aria-label="Your business at the centre, linked to its partners">${lines}<g class="me"><rect x="${cx - 46}" y="${cy - 16}" width="92" height="32" rx="10"/><text x="${cx}" y="${cy + 4.5}" text-anchor="middle">Tail &amp; Co.</text></g><g id="apPk"></g>${boxes}</svg>`;
    }
    function dealHTML(d) {
      const [lbl, tone] = STATUS[d.st];
      let acts = '';
      if (d.st === 'new') acts = `<div class="acts"><button type="button" class="ap-btn pri" data-d="accept">Accept</button><button type="button" class="ap-btn" data-d="counter">Counter at ${esc(d.counter)}</button><button type="button" class="ap-btn ghost" data-d="pass">Pass</button></div>`;
      else if (d.st === 'talk') acts = `<div class="msg">${av('ravi')}<span>${esc(d.msg)}</span></div>` + (d.reply ? `<div class="acts"><button type="button" class="ap-btn pri" data-d="accept">Accept</button><button type="button" class="ap-btn ghost" data-d="pass">Pass</button></div>` : '');
      else acts = `<div class="acts"><span class="ap-pill quiet">${d.id === 'swift' ? '46 deliveries this week' : d.id === 'hound' ? '3 orders this month' : 'Live since today'}</span></div>`;
      return `<div class="ap-deal-h"><span class="ap-av biz" aria-hidden="true">${esc(d.n.split(' ').map(w => w[0]).join('').slice(0, 2))}</span><span><b>${esc(d.n)}</b><small>${esc(d.what)}${d.on ? ' · on M-World' : ''}</small></span><span class="ap-pill ${tone}">${lbl}</span></div>
        <p>${esc(d.p)}</p><div class="terms">${d.terms.map(x => `<span>${esc(x)}</span>`).join('')}</div>${acts}`;
    }
    function renderPlan() {
      const counts = s => DEALS.filter(d => d.st === s).length;
      toolsEl.innerHTML = `<span class="ap-pill blue">${counts('new')} new</span><span class="ap-pill amber">${counts('talk')} negotiating</span><span class="ap-pill ink">${counts('active')} active</span>`;
      const wrap = make('div', 'ap-plan');
      wrap.innerHTML = `<div class="ap-map">${mapSVG()}<div class="ap-legend"><span><i></i>Proposed</span><span><i class="talk"></i>Negotiating</span><span><i class="active"></i>Working together</span></div></div>
        <div class="ap-deals">${DEALS.map(d => `<div class="ap-deal${d.id === selDeal ? ' sel' : ''}" data-id="${d.id}">${dealHTML(d)}</div>`).join('')}
        <p class="ap-private"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>Talks between businesses stay private. If a deal falls through, nobody learns what was discussed.</p></div>`;
      view.appendChild(wrap);
      wrap.addEventListener('click', e => {
        const b = e.target.closest('[data-d]'), card = e.target.closest('[data-id]');
        if (!card) return;
        const d = DEALS.find(x => x.id === card.dataset.id); if (!d) return;
        selDeal = d.id;
        if (b) {
          if (b.dataset.d === 'accept') { d.st = 'active'; toast('ravi', `The deal with ${esc(d.n)} is live.`); }
          else if (b.dataset.d === 'counter') {
            d.st = 'talk'; d.msg = `I offered ${d.counter}. Waiting for their reply.`; d.reply = false; toast('ravi', `Counter sent to ${esc(d.n)}.`);
            setTimeout(() => { d.msg = `${d.n} agreed to ${d.counter}.`; d.reply = true; d.terms[0] = d.counter; toast('ravi', `${esc(d.n)} agreed to ${esc(d.counter)}.`); if (tab === 'plan') rerender(); }, 2600);
          } else if (b.dataset.d === 'pass') {
            DEALS.splice(DEALS.indexOf(d), 1); selDeal = DEALS[0] && DEALS[0].id; toast('ravi', 'Closed. Nothing you shared leaves your business.');
            const next = MORE_DEALS[moreAt++ % MORE_DEALS.length];
            setTimeout(() => { if (!DEALS.find(x => x.id === next.id)) { DEALS.unshift({ ...next, terms: [...next.terms] }); toast('ravi', `New proposal from ${esc(next.n)}.`); if (tab === 'plan') rerender(); } }, 3200);
          }
        }
        rerender();
      });
    }
    function rerender() { const y = view.scrollTop; view.classList.remove('in'); view.innerHTML = ''; toolsEl.innerHTML = ''; TABS[tab][2](); view.scrollTop = y; }
    // a parcel runs along each working partnership
    function stepPackets(dt) {
      const g = view.querySelector('#apPk'); if (!g) return;
      packetT += dt;
      const paths = [...view.querySelectorAll('.ap-map .ln.active, .ap-map .ln.talk')];
      g.innerHTML = paths.map((p, i) => { const L = p.getTotalLength(), u = ((packetT * .28 + i * .37) % 1), back = i % 2, pt = p.getPointAtLength(L * (back ? 1 - u : u)); return `<circle class="pk" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.2" opacity="${Math.min(1, u * 6, (1 - u) * 6).toFixed(2)}"/>`; }).join('');
    }

    // ================= WORKFLOWS: the routines that repeat =================
    const FLOWS = [
      { id: 'order', n: 'New order', on: true, runs: 46, unit: 'orders today', steps: [['Order placed', 'cust'], ['Payment confirmed', 'pay'], ['Packed in a branded box', 'paws'], ['Shipped the same day', 'swift'], ['Thank-you email', 'juno'], ['Review request after 7 days', 'juno']],
        item: n => `Order #${1040 + n} · ${['Duck jerky ×2', 'Chicken bites', 'Salmon crunch ×3', 'Trial pack', 'Duck jerky, Chicken bites'][n % 5]}` },
      { id: 'content', n: 'Weekly content', on: true, runs: 3, unit: 'weeks published', steps: [['Pick the week’s topics', 'theo'], ['Write the posts', 'juno'], ['Shoot the photos', 'ananya'], ['You approve the week', 'you', true], ['Publish and reply', 'juno']],
        item: n => `Week ${44 + n}: ${['Treats for training', 'Meet the makers', 'Festive gift ideas'][n % 3]}` },
      { id: 'restock', n: 'Restock', on: true, runs: 2, unit: 'restocks this month', steps: [['Stock falls below 50 packs', 'ada'], ['Draft the order', 'mira'], ['Orders over $300 need you', 'you', true], ['Supplier ships', 'hound'], ['Store updated', 'kai']],
        item: n => `${['Duck jerky', 'Salmon crunch', 'Chicken bites'][n % 3]}: ${[400, 250, 300][n % 3]} packs` },
      { id: 'refund', n: 'Refund request', on: true, runs: 1, unit: 'refunds this week', steps: [['Customer asks for a refund', 'cust'], ['Sara checks the order', 'sara'], ['Refunds over $40 need you', 'you', true], ['Refund sent', 'pay'], ['Follow-up note', 'sara']],
        item: n => `Order #${1012 + n * 7} · ${usd([46, 18, 62][n % 3])}` }
    ];
    let selFlow = 'order', fAcc = 0;
    const RUNS = { order: [], content: [], restock: [], refund: [] }, cur = {};
    FLOWS.forEach(f => { cur[f.id] = { i: 0, n: 0, wait: false }; });
    RUNS.order.push({ t: FLOWS[0].item(1), at: '10:03', st: 'done' }, { t: FLOWS[0].item(0), at: '09:58', st: 'done' }); cur.order.n = 2;
    function flowStep(f) {
      // one run walks the steps; a gate stops it until you approve
      const c = cur[f.id]; if (!f.on || c.wait) return;
      c.i++;
      if (c.i >= f.steps.length) { RUNS[f.id].unshift({ t: f.item(c.n), at: clock(), st: 'done' }); f.runs++; c.n++; c.i = 0; }
      else if (f.steps[c.i][2]) { c.wait = true; RUNS[f.id].unshift({ t: f.item(c.n), at: clock(), st: 'wait' }); }
      RUNS[f.id].length = Math.min(RUNS[f.id].length, 4);
    }
    const runsHTML = f => RUNS[f.id].length ? RUNS[f.id].map(r => `<div class="ap-run" data-r="${esc(r.t)}|${r.st}">${r.st === 'wait' ? '<span class="ap-pill amber">Waiting for you</span>' : '<span class="ap-pill blue">Done</span>'}<span>${esc(r.t)}</span>${r.st === 'wait' ? '<button type="button" class="ap-btn pri" data-go="1" style="margin-left:auto">Approve</button>' : `<time>${r.at}</time>`}</div>`).join('') : '<p class="ap-empty">No runs yet. The next one starts on its own.</p>';
    // keep the view in place between runs: move the live step, refresh the runs list and the counts
    function updateFlows() {
      const f = FLOWS.find(x => x.id === selFlow), c = cur[f.id];
      view.querySelectorAll('.ap-step').forEach((el, i) => el.classList.toggle('live', f.on && i === c.i));
      const box = view.querySelector('.ap-runs'), key = RUNS[f.id].map(r => r.t + r.st).join();
      if (box && box.dataset.key !== key) {
        const old = new Set([...box.querySelectorAll('.ap-run')].map(e => e.dataset.r));
        box.innerHTML = runsHTML(f); box.dataset.key = key;
        box.querySelectorAll('.ap-run').forEach(e => { if (old.has(e.dataset.r)) e.style.animation = 'none'; });
      }
      view.querySelectorAll('.ap-fi').forEach((b, i) => { b.querySelector('small').textContent = FLOWS[i].runs + ' ' + FLOWS[i].unit; });
    }
    function renderFlows() {
      const f = FLOWS.find(x => x.id === selFlow), c = cur[f.id];
      toolsEl.innerHTML = `<span class="ap-pill ${f.on ? 'blue' : 'quiet'}">${f.on ? 'Running' : 'Paused'}</span>`;
      const wrap = make('div', 'ap-flows');
      wrap.innerHTML = `<div class="ap-flist">${FLOWS.map(x => `<button type="button" class="ap-fi" data-f="${x.id}" aria-pressed="${x.id === selFlow}"><b>${esc(x.n)}</b><span class="ap-sw${x.on ? '' : ' off'}" data-sw="${x.id}" role="switch" aria-checked="${x.on}" aria-label="${x.on ? 'Pause' : 'Run'} ${esc(x.n)}"></span><small>${x.runs} ${esc(x.unit)}</small></button>`).join('')}</div>
        <div class="ap-fpanel"><div class="ap-fpanel-h"><h4>${esc(f.n)}</h4><span class="ap-pill quiet">${f.steps.length} steps · ${f.steps.filter(s => s[2]).length ? 'stops for you once' : 'runs on its own'}</span></div>
          <div class="ap-pipe" style="--n:${f.steps.length}">${f.steps.map((s, i) => `<div class="ap-step${s[2] ? ' gate' : ''}${f.on && i === c.i ? ' live' : ''}"><span class="k">${s[2] ? 'Needs you' : 'Step ' + (i + 1)}</span><b>${esc(s[0])}</b><span class="w">${av(s[1])}${esc(s[1] === 'cust' ? 'Customer' : s[1] === 'you' ? 'You' : nameOf(s[1]))}</span></div>`).join('')}</div>
          <div><p class="ap-sh" style="margin-bottom:8px">Latest runs</p><div class="ap-runs">${runsHTML(f)}</div></div></div>`;
      view.appendChild(wrap);
      wrap.addEventListener('click', e => {
        const sw = e.target.closest('[data-sw]'), fi = e.target.closest('[data-f]'), go = e.target.closest('[data-go]');
        if (sw) { const x = FLOWS.find(y => y.id === sw.dataset.sw); x.on = !x.on; selFlow = x.id; toast('mira', `${esc(x.n)} ${x.on ? 'is running again' : 'is paused. Nothing new starts until you turn it back on'}.`); rerender(); return; }
        if (go) { const r = RUNS[f.id].find(x => x.st === 'wait'); if (r) r.st = 'done'; c.wait = false; toast('mira', 'Approved. The run carries on.'); rerender(); return; }
        if (fi) { selFlow = fi.dataset.f; rerender(); }
      });
    }

    // ================= MONEY: what came in, what went out, what is yours =================
    const WEEKS = ['1 Sep', '8 Sep', '15 Sep', '22 Sep', '29 Sep', '6 Oct', '13 Oct', '20 Oct'];
    const REV = [420, 610, 780, 940, 1050, 1180, 1270, 1360], COST = [900, 820, 760, 700, 720, 740, 750, 760];
    const SPEND = [['hound', 'Treats from Happy Hound Foods', 1120], ['paws', 'Boxes from Paws & Co.', 480], ['swift', 'Delivery by Swift Courier', 420], ['juno', 'Ads, run by Juno', 300], ['ananya', 'Photos by Ananya', 180], ['sara', 'Support by Sara', 180], ['pay', 'Payment fees', 140], ['dev', 'Accounting by Dev', 120], ['mw', 'M-World plan', 30]];
    const PRODUCTS = [['Duck jerky', 210, 1890, 46], ['Chicken bites', 270, 1620, 41], ['Salmon crunch', 150, 1350, 38]];
    let chartMode = 'both', suggAt = 0;
    const SUGG = [
      { w: 'ada', t: '<b>Duck jerky sells out every week.</b> Raise it from $9 to $10? At the same demand that adds about $210 a month.', ok: 'Approve price change', done: 'Duck jerky is now $10. I’ll watch demand for two weeks.' },
      { w: 'theo', t: '<b>Bark Box Club wants 1,200 packs a month.</b> Taking it would roughly double duck-jerky volume at a lower margin.', ok: 'Open in Plan', go: 'plan' },
      { w: 'ada', t: '<b>Delivery costs fell 12% with Swift Courier.</b> Nothing to do; I’ll keep an eye on it.', ok: 'Got it', done: 'Noted.' }
    ];
    function chartSVG() {
      const W = 560, H = 210, L = 44, R = 10, Tp = 12, B = 26, n = WEEKS.length, x = i => L + (W - L - R) * i / (n - 1);
      const prof = REV.map((r, i) => r - COST[i]);
      let hi, lo;
      if (chartMode === 'both') { hi = 1500; lo = 0; } else { hi = 800; lo = -600; }
      const y = v => Tp + (H - Tp - B) * (hi - v) / (hi - lo);
      const ticks = chartMode === 'both' ? [0, 500, 1000, 1500] : [-600, -300, 0, 300, 600];
      let s = ticks.map(t => `<line class="g${t === 0 ? ' zero' : ''}" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="ax" x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${usd(t)}</text>`).join('');
      s += WEEKS.map((w, i) => i % 2 ? '' : `<text class="ax" x="${x(i)}" y="${H - 6}" text-anchor="middle">${w}</text>`).join('');
      if (chartMode === 'both') {
        const pr = REV.map((v, i) => `${x(i)},${y(v)}`).join(' '), pc = COST.map((v, i) => `${x(i)},${y(v)}`).join(' ');
        s += `<polygon class="area" points="${x(0)},${y(0)} ${pr} ${x(n - 1)},${y(0)}"/><polyline class="rev" points="${pr}"/><polyline class="cost" points="${pc}"/>`;
      } else {
        const bw = (W - L - R) / n * .5;
        s += prof.map((v, i) => `<rect class="prof${v < 0 ? ' neg' : ''}" x="${x(i) - bw / 2}" y="${Math.min(y(v), y(0))}" width="${bw}" height="${Math.abs(y(v) - y(0))}" rx="3"/>`).join('');
      }
      s += `<line class="hov" id="apHov" x1="0" x2="0" y1="${Tp}" y2="${H - B}" opacity="0"/>`;
      s += WEEKS.map((w, i) => `<rect data-i="${i}" x="${x(i) - (W - L - R) / (n - 1) / 2}" y="0" width="${(W - L - R) / (n - 1)}" height="${H}" fill="transparent"/>`).join('');
      return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue, costs and profit by week">${s}</svg>`;
    }
    function renderMoney() {
      toolsEl.innerHTML = '<span class="ap-pill quiet">Last 4 weeks · USD</span>';
      const total = SPEND.reduce((a, s) => a + s[2], 0), max = SPEND[0][2], sg = SUGG[suggAt % SUGG.length];
      const wrap = make('div', 'ap-money');
      wrap.innerHTML = `<div class="ap-kpis">
          <div class="ap-kpi"><small>Revenue</small><b>$4,860</b><span class="d up">+77% on the 4 weeks before</span></div>
          <div class="ap-kpi"><small>Costs</small><b>${usd(total)}</b><span class="d">61% of revenue, and falling</span></div>
          <div class="ap-kpi you"><small>Profit, yours</small><b>$1,890</b><span class="d">Paid to you on 1 Nov</span></div>
          <div class="ap-kpi"><small>Budget left</small><b>$1,130</b><span class="d">of $4,100 you approved</span></div></div>
        <div class="ap-mrow"><div class="ap-panel"><div class="ap-panel-h"><h4>Growth</h4><div class="ap-seg" role="group" aria-label="Chart"><button type="button" data-m="both" aria-pressed="${chartMode === 'both'}">Revenue and costs</button><button type="button" data-m="profit" aria-pressed="${chartMode === 'profit'}">Profit</button></div></div>
            <div class="ap-chart" id="apChart">${chartSVG()}<div class="ap-tip" id="apTip"></div></div>
            ${chartMode === 'both' ? '<div class="ap-key"><span><i></i>Revenue</span><span><i class="c"></i>Costs</span></div>' : '<div class="ap-key"><span>Profit turned positive in the third week.</span></div>'}</div>
          <div class="ap-panel"><div class="ap-panel-h"><h4>Where the money went</h4></div><ul class="ap-spend">${SPEND.map(s => `<li class="${TEAM[s[0]].k}">${av(s[0])}<span class="nm">${esc(s[1])}</span><span class="v">${usd(s[2])}</span><span class="bar"><i style="width:${Math.max(3, s[2] / max * 100)}%"></i></span></li>`).join('')}</ul></div></div>
        <div class="ap-mrow"><div class="ap-panel"><div class="ap-panel-h"><h4>Products</h4></div><table class="ap-prod"><thead><tr><th>Product</th><th>Sold</th><th>Revenue</th><th>Margin</th></tr></thead><tbody>${PRODUCTS.map(p => `<tr><td>${p[0]}</td><td>${p[1]}</td><td>${usd(p[2])}</td><td>${p[3]}%</td></tr>`).join('')}</tbody></table></div>
          <div class="ap-panel"><div class="ap-panel-h"><h4>Suggested by your team</h4></div><div class="ap-sugg"><div class="ap-sugg-h">${av(sg.w)}<span>${sg.t}</span></div><div class="acts"><button type="button" class="ap-btn pri" data-s="ok">${esc(sg.ok)}</button><button type="button" class="ap-btn" data-s="no">Not now</button></div></div></div></div>`;
      view.appendChild(wrap);
      wrap.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { chartMode = b.dataset.m; rerender(); }));
      wrap.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.s === 'ok' && sg.go) { suggAt++; show(sg.go); return; }
        if (b.dataset.s === 'ok') toast(sg.w, sg.done); suggAt++; rerender();
      }));
      const ch = $('apChart'), tip = $('apTip'), hov = $('apHov');
      ch.addEventListener('pointermove', e => {
        const r = e.target.closest('rect[data-i]'); if (!r) return;
        const i = +r.dataset.i, svg = ch.querySelector('svg'), k = svg.getBoundingClientRect().width / 560, xx = 44 + (560 - 54) * i / 7;
        hov.setAttribute('x1', xx); hov.setAttribute('x2', xx); hov.setAttribute('opacity', 1);
        tip.innerHTML = `<b>Week of ${WEEKS[i]}</b><br>Revenue ${usd(REV[i])} · Costs ${usd(COST[i])}<br>Profit ${usd(REV[i] - COST[i])}`;
        tip.style.left = Math.min(Math.max(xx * k, 90), svg.getBoundingClientRect().width - 90) + 'px'; tip.style.top = '34px'; tip.classList.add('on');
      });
      ch.addEventListener('pointerleave', () => { tip.classList.remove('on'); hov.setAttribute('opacity', 0); });
    }

    // ================= PEOPLE: the AI team and the people it hired =================
    const CHATS = {
      mira: [['mira', 'Morning. Sprint 2 is 70% done. Two things need you today: the Instagram ads and the pet-fair stall.'], ['mira', 'Everything else is moving. Ananya shoots the new range on Thursday.']],
      theo: [['theo', 'A monthly treat box could lift repeat orders. I’m testing it with 30 customers before we commit.']],
      kai: [['kai', 'The landing page is live. Mobile checkout had a bug on Safari; the fix is nearly done.'], ['you', 'Can we add a referral page?'], ['kai', 'Yes. Theo suggests "give $5, get $5". I’ll have a first version by Friday.']],
      ada: [['ada', 'Profit is $1,890 over the last four weeks. Costs are 61% of revenue and falling.']],
      juno: [['juno', 'I made three ad versions for the launch. The one with the dog mid-jump did best with 40 test viewers.'], ['juno', 'I suggest $150 over 7 days. It’s on your board.', 'ads']],
      ravi: [['ravi', 'Bark Box Club wants your duck jerky in its monthly box: 1,200 packs a month. I’d counter at $3.60. It’s in Plan.']],
      ananya: [['ananya', 'Hi! Confirmed for Thursday 10:00. I’ll shoot all three treats on white, plus two lifestyle shots with a dog.']],
      sara: [['sara', '18 questions today, mostly about ingredients. Three were about allergies, so I passed them to Mira for a careful reply.']],
      dev: [['dev', 'October’s return is ready. It needs your signature; I’ve put it on the board.']]
    };
    const QUICK = ['What’s next?', 'How are we doing?', 'Take the rest of the day off'];
    let selP = 'mira';
    function reply(k, text) {
      const s = text.toLowerCase(), ai = TEAM[k].k === 'ai';
      if (s.includes('next')) return `Next for me: ${TEAM[k].s.charAt(0).toLowerCase() + TEAM[k].s.slice(1)}.`;
      if (s.includes('doing') || s.includes('how are')) return k === 'ada' ? 'Revenue is up 77% on the month before, and we’ve been profitable for three weeks.' : 'Good. Everything I own is on track, and I’ll flag it early if that changes.';
      if (s.includes('day off') || s.includes('pause')) return ai ? 'Paused until 9:00 tomorrow. Nothing new starts without you.' : 'Thanks! See you tomorrow.';
      return null;
    }
    function msgHTML(m) {
      const [f, t, act] = m, me = f === 'you';
      return `<div class="ap-msg${me ? ' me' : ''}">${me ? '' : av(f)}<div class="bub"><span>${esc(t)}</span>${act === 'ads' ? '<div class="acts"><button type="button" class="ap-btn pri" data-a="ads">Approve $150</button><button type="button" class="ap-btn" data-a="adsno">Change it</button></div>' : ''}</div></div>`;
    }
    function renderPeople() {
      const p = TEAM[selP], ai = Object.keys(TEAM).filter(k => TEAM[k].k === 'ai' && k !== 'mw'), ppl = Object.keys(TEAM).filter(k => TEAM[k].k === 'ppl');
      toolsEl.innerHTML = `<span class="ap-pill blue">${ai.length} AI departments</span><span class="ap-pill amber">${ppl.length} people hired</span>`;
      const item = k => `<button type="button" class="ap-pi ${TEAM[k].k}" data-p="${k}" aria-pressed="${k === selP}">${av(k, 'lg')}<b>${esc(TEAM[k].n)} <em>${esc(TEAM[k].r)}</em></b><small><span class="live"></span> ${esc(TEAM[k].s)}</small></button>`;
      const wrap = make('div', 'ap-people');
      wrap.innerHTML = `<div class="ap-plist"><p class="ap-psh">AI team</p>${ai.map(item).join('')}<p class="ap-psh">People you’ve hired</p>${ppl.map(item).join('')}</div>
        <div class="ap-chat"><div class="ap-chat-h">${av(selP, 'lg')}<span><b>${esc(p.n)}</b><small>${esc(p.r)}${p.k === 'ppl' ? ' · hired by Mira' : ' · AI department'}</small></span><span class="ap-pill ${p.k === 'ppl' ? 'amber' : 'blue'}">${esc(p.s)}</span></div>
          <div class="ap-msgs" id="apMsgs">${CHATS[selP].map(msgHTML).join('')}</div>
          <div><div class="ap-quick">${QUICK.map(q => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
          <form class="ap-compose" id="apCompose"><label class="sr" for="apMsgIn">Message ${esc(p.n)}</label><input id="apMsgIn" placeholder="Message ${esc(p.n.split(' ')[0])}… (it becomes a task)" autocomplete="off"><button type="submit" aria-label="Send"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg></button></form></div></div>`;
      view.appendChild(wrap);
      const msgs = $('apMsgs'); msgs.scrollTop = msgs.scrollHeight;
      const send = text => {
        CHATS[selP].push(['you', text]); msgs.insertAdjacentHTML('beforeend', msgHTML(['you', text]));
        const typing = make('div', 'ap-msg', av(selP) + '<div class="bub"><span class="ap-typing"><i></i><i></i><i></i></span></div>'); msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight;
        const who = selP;
        setTimeout(() => {
          let r = reply(who, text);
          if (!r) { const w = TEAM[who].k === 'ai' || TEAM[who].k === 'ppl' ? who : 'mira'; spawn({ t: text.charAt(0).toUpperCase() + text.slice(1), w, from: 'you' }, true); needsCount(); r = TEAM[who].k === 'ppl' ? 'Got it. I’ve added it to my list on the board.' : 'On it. It’s on the board, and I’ll tell you when it’s done.'; }
          CHATS[who].push([who, r]);
          if (tab === 'people' && selP === who) { typing.remove(); msgs.insertAdjacentHTML('beforeend', msgHTML([who, r])); msgs.scrollTop = msgs.scrollHeight; }
        }, reduce ? 50 : 900 + Math.random() * 500);
      };
      wrap.addEventListener('click', e => {
        const pi = e.target.closest('[data-p]'), q = e.target.closest('[data-q]'), a = e.target.closest('[data-a]');
        if (pi) { selP = pi.dataset.p; rerender(); return; }
        if (q) { send(q.dataset.q); return; }
        if (a) {
          const t = T.find(x => x.w === 'juno' && x.col === 'you' && x.t.includes('Instagram'));
          a.closest('.acts').remove(); CHATS.juno[1] = [CHATS.juno[1][0], CHATS.juno[1][1]];
          if (a.dataset.a === 'ads') { if (t) approve(t); CHATS.juno.push(['juno', 'Thanks. The ads go live at 6 pm, and I’ll report results tomorrow.']); }
          else CHATS.juno.push(['juno', 'Sure. Tell me what to change: the budget, the days, or the picture.']);
          msgs.insertAdjacentHTML('beforeend', msgHTML(CHATS.juno.at(-1))); msgs.scrollTop = msgs.scrollHeight;
        }
      });
      $('apCompose').addEventListener('submit', e => { e.preventDefault(); const v = $('apMsgIn').value.trim(); if (!v) return; $('apMsgIn').value = ''; send(v); });
    }

    // ================= tabs and the clock =================
    const TABS = {
      board: ['Board', 'Everything your business is working on this week.', renderBoard],
      plan: ['Plan', 'Partners your business is talking to, on M-World and off it.', renderPlan],
      flows: ['Workflows', 'The routines that run on their own, and where they stop for you.', renderFlows],
      money: ['Money', 'What came in, what went out, and what is yours.', renderMoney],
      people: ['People', 'Your AI team and the people your business has hired.', renderPeople]
    };
    let tab = 'board';
    const navBtns = [...app.querySelectorAll('.ap-nav [data-tab]')];
    function show(t) {
      tab = t; closeDrawer();
      navBtns.forEach(b => { const on = b.dataset.tab === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      const side = app.querySelector('.ap-side'), sb = navBtns.find(b => b.dataset.tab === t);
      if (side.scrollWidth > side.clientWidth) side.scrollTo({ left: sb.offsetLeft - 8, behavior: reduce ? 'auto' : 'smooth' });
      $('apTitle').textContent = TABS[t][0]; $('apSub').textContent = TABS[t][1];
      toolsEl.innerHTML = ''; view.innerHTML = ''; view.scrollTop = 0;
      view.classList.remove('in'); void view.offsetWidth; if (!reduce) view.classList.add('in');
      TABS[t][2]();
    }
    navBtns.forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
    app.querySelector('.ap-nav').addEventListener('keydown', e => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!k) return;
      e.preventDefault(); const i = (navBtns.findIndex(b => b.dataset.tab === tab) + k + navBtns.length) % navBtns.length; show(navBtns[i].dataset.tab); navBtns[i].focus();
    });
    show('board'); needsCount();
    if (!reduce) animate(app, dt => {
      if (!drawer.classList.contains('open') && !dragId && (bAcc += dt) > 2.2) { bAcc = 0; beat(); }
      if ((fAcc += dt) > 1.1) {
        fAcc = 0; FLOWS.forEach(flowStep);
        if (tab === 'flows') updateFlows();
      }
      if (tab === 'plan') stepPackets(dt);
    });
  }

