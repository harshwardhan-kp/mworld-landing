  // ================= THE BOARD: the whole business on one board =================
  // To do → In progress → Done, with one column that waits for the owner. Cards follow the hero's example;
  // each names who does the work: an AI department (blue), a person (amber) or a business (ink).
  const board = $('board');
  const DEPT = { STR: 'Strategy', MGT: 'Management', TEC: 'Technology', FIN: 'Finance', MKT: 'Marketing', SAL: 'Sales' };
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const who = t => t.k === 'ai' ? DEPT[t.w] : t.k === 'chain' ? cap1(t.w[0]) + ' → ' + t.w[1] : cap1(t.w);
  const kind = t => t.k === 'chain' ? 'biz' : t.k;
  const STATUS = {
    todo: () => 'Queued',
    doing: t => kind(t) === 'ai' ? 'Working' : kind(t) === 'ppl' ? 'Booked, on the job' : 'Ordered',
    you: () => 'Waiting for your OK',
    done: () => 'Done'
  };
  const bcol = c => board && board.querySelector(`.bcol[data-c="${c}"] ol`);
  let bState = null, bAcc = 0, bWait = 0, bSeq = 0;
  // move cards with a FLIP: measure, move, then slide every card from where it was
  function flip(change) {
    const cards = [...board.querySelectorAll('.card')], before = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
    change();
    if (reduce) return;
    for (const c of board.querySelectorAll('.card')) {
      const a = before.get(c), b = c.getBoundingClientRect();
      if (!a) { c.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' }); continue; }
      const dx = a.left - b.left, dy = a.top - b.top;
      if (dx || dy) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }
  function cardEl(t) {
    const li = document.createElement('li');
    li.className = 'card k-' + kind(t); li.dataset.id = t.id;
    li.innerHTML = `<span class="ct"></span><span class="cm"><i aria-hidden="true"></i><span class="cw"></span><span class="cs"></span></span><span class="cp" aria-hidden="true"><i></i></span>`;
    li.querySelector('.ct').textContent = t.t; li.querySelector('.cw').textContent = who(t);
    if (t.ask) {
      const act = document.createElement('span'); act.className = 'cact';
      act.innerHTML = '<button type="button" class="ok">Approve</button><button type="button" class="no">Edit</button>';
      li.appendChild(act);
    }
    return li;
  }
  function paint(li, t, col) {
    li.dataset.col = col;
    li.querySelector('.cs').textContent = STATUS[col](t);
    li.querySelector('.cp i').style.width = Math.round((col === 'done' ? 1 : t.p) * 100) + '%';
  }
  function counts() {
    for (const c of ['todo', 'doing', 'you', 'done']) board.querySelector(`.bcol[data-c="${c}"] .n`).textContent = bcol(c).children.length;
    const all = board.querySelectorAll('.card').length, done = bcol('done').children.length;
    $('bDone').textContent = done + ' of ' + all + ' done';
  }
  function place(t, col, top) {
    let li = board.querySelector(`.card[data-id="${t.id}"]`) || cardEl(t);
    const list = bcol(col);
    top ? list.prepend(li) : list.append(li);
    paint(li, t, col);
  }
  function loadBoard(s) {
    if (!board) return;
    $('bName').textContent = s.name;
    bSeq++;
    const tasks = s.tasks.map((t, i) => ({ ...t, id: bSeq + '-' + i, p: 0 }));
    const ask = { ...s.approve, id: bSeq + '-ask', p: 0, ask: true };
    bState = { s, tasks, ask, col: new Map() };
    flip(() => {
      for (const l of board.querySelectorAll('.bcol ol')) l.innerHTML = '';
      tasks.forEach((t, i) => { const c = i < 2 ? 'done' : i < 4 ? 'doing' : 'todo'; if (c === 'doing') t.p = i === 2 ? .55 : .2; bState.col.set(t, c); });
      for (const c of ['done', 'doing', 'todo']) tasks.filter(t => bState.col.get(t) === c).forEach(t => place(t, c));
      bState.col.set(ask, 'you'); place(ask, 'you');
    });
    counts(); bWait = 0;
  }
  // one beat: work moves forward; the card in Needs you waits until the owner approves it
  function boardBeat() {
    if (!bState) return;
    const { tasks, col } = bState, inCol = c => [...col].filter(([, v]) => v === c).map(([t]) => t);
    const doing = inCol('doing'), todo = inCol('todo');
    if (!doing.length && !todo.length) { if (++bWait > 1) loadBoard(bState.s); return; }
    flip(() => {
      for (const t of doing) { t.p = Math.min(1, t.p + .35); paint(board.querySelector(`.card[data-id="${t.id}"]`), t, 'doing'); }
      const fin = doing.find(t => t.p >= 1);
      if (fin) { col.set(fin, 'done'); place(fin, 'done', true); }
      if (inCol('doing').length < 2 && todo.length) { const n = todo[0]; n.p = .12; col.set(n, 'doing'); place(n, 'doing'); }
    });
    counts();
  }
  if (board) {
    board.addEventListener('click', e => {
      const ok = e.target.closest('.ok'), no = e.target.closest('.no'); if (!ok && !no || !bState) return;
      const t = bState.ask, li = board.querySelector(`.card[data-id="${t.id}"]`);
      if (no) { li.querySelector('.cs').textContent = 'Opened for your edits'; replay(li.querySelector('.cs')); return; }
      li.querySelector('.cact').remove(); t.ask = false; t.p = .15;
      flip(() => { bState.col.set(t, 'doing'); place(t, 'doing', true); });
      counts(); bAcc = 0;
    });
    if (!reduce) animate(board, dt => { if ((bAcc += dt) > 2.4) { bAcc = 0; boardBeat(); } });
  }

