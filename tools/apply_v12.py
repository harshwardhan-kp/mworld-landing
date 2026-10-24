"""v12: the six feelings on the page, and fewer things per frame.

- How it works becomes one product view: the business on a Kanban board (efficient, trustworthy, empowered).
- Departments loses the side spheres, the dotted footer line, the tag line and its second button.
- The comparison table becomes "You stay in charge" (trustworthy).
- Pricing says M-World takes no cut of your sales (empowered); "Autonomous Organisation" becomes "your business".
- The closing section becomes the network: businesses placed on the globe, linked (sense of connectivity).

Run after apply_warm.py:  python3 tools/apply_v12.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
page = (root / 'index.html').read_text()

def sub1(old, new, s):
    if old not in s:
        raise SystemExit(f'missing: {old[:80]!r}')
    return s.replace(old, new, 1)

# ---------- one name for the thing you own, one name for the action ----------
page = page.replace('>Start building</a>', '>Build your business</a>')
page = sub1('aria-label="Build my organisation"', 'aria-label="Build my business"', page)
page = sub1("   ASCII only where it carries the idea: the core sphere, the org chart, the blue field's edges, the sunrise, the wordmark. */",
            "   ASCII only where it carries the idea: the core sphere, the org chart, the globe of businesses, the wordmark. */", page)

# ---------- How it works → the board ----------
a = page.index('<!-- HOW IT WORKS:')
b = page.index('</section>', a) + len('</section>')
page = page[:a] + (src / 'app.html').read_text().rstrip('\n') + page[b:]
page = sub1('/* ---------- autonomous organisation + video ---------- */', (src / 'app.css').read_text() + '\n/* ---------- you stay in charge + video ---------- */', page)
page = sub1('/* ---------- you stay in charge + video ---------- */', '.brand { white-space: nowrap; }\n@media (max-width: 440px) { .brand { font-size: 18px; gap: 8px; } .nav .cell { gap: 12px; } .nav .btn-sm { padding: 0 14px; font-size: 14px; } }\n\n/* ---------- you stay in charge + video ---------- */', page)
a = page.index('  // ================= HOW: prompt')
b = page.index('  // org chart + department tabs')
page = page[:a] + page[b:]
page = sub1('layoutWires(); drawSphere(); treeGeo(); });', 'layoutWires(); drawSphere(); });', page)
page = sub1('  onResize(map, () => { layoutWires(); });', (src / 'app.js').read_text() + '  onResize(map, () => { layoutWires(); });', page)
page = page.replace("const groups = ['.head .cell', '.actor .cell',", "const groups = ['.head .cell',")

# ---------- Departments: one chart, one line, one control ----------
page = sub1('  <canvas class="edge" id="edge" aria-hidden="true"></canvas>\n', '', page)
page = sub1("<p class=\"text\">Every organisation gets the same six departments, working every hour you're not. Each owns its part of the business and hands work to the others.</p>",
            "<p class=\"text\">Your business gets six departments that work every hour you're not, each on its own part of your idea.</p>", page)
page = sub1('<div class="dpanel" role="tabpanel" id="dpanel" aria-live="polite"><p id="dRole"></p><small id="dOut"></small></div>\n    <a class="btn btn-white" href="https://builder.mworld.tech/?utm_source=landing&amp;utm_medium=departments" target="_blank" rel="noopener">Build your business</a>',
            '<div class="dpanel" role="tabpanel" id="dpanel" aria-live="polite"><p id="dRole"></p></div>', page)
page = page.replace("'YOUR AUTONOMOUS ORGANISATION'", "'YOUR BUSINESS'")
page = sub1("    r = blank(); put(r, rx, '│ ' + 'goal: first 100 customers'.padEnd(RW - 4) + ' │', 'rt'); rows.push(r);\n", '', page)
page = sub1("    r = blank(); rows.push(r);\n    r = blank(); put(r, 2, '· · · people booked for real-world work · · · · · · · · · partner businesses on the network · · ·', 'X'); rows.push(r);\n", '', page)
page = sub1("    line([['', '']]); line([['+ people and partner businesses', 'X']]);\n", '', page)
page = sub1("$('dOut').textContent = DINFO[i][3]; replay($('dRole')); replay($('dOut'));", "replay($('dRole'));", page)

# ---------- the comparison table → you stay in charge ----------
page = sub1('<!-- WHAT IS AN AO + VIDEO -->', '<!-- YOU STAY IN CHARGE + VIDEO -->', page)
page = re.sub(r'<h2 class="h2" id="ao-title">What is an Autonomous Organisation\?</h2>.*?</table>',
              '''<h2 class="h2" id="ao-title">You stay in charge</h2>
      <ul class="trust">
        <li><b>You approve the plan and the budget.</b> Nothing starts until you say yes. On Semi-Autonomous it also asks before every big decision.</li>
        <li><b>You see everything it does.</b> Every task, booking, order and payment shows up on your board.</li>
        <li><b>Your business stays yours.</b> You own it and keep the profit. No other owner can see inside it.</li>
      </ul>''', page, count=1, flags=re.S)
page = sub1('.ao .text b { color: var(--fg); font-weight: 500; }',
            '.ao .text b { color: var(--fg); font-weight: 500; }\n'
            '.trust { list-style: none; margin: 8px 0 0; padding: 0; display: grid; }\n'
            '.trust li { padding: 22px 0; border-top: 1px solid var(--line); font-size: 17px; line-height: 1.5; color: var(--muted); max-width: 46ch; }\n'
            '.trust li:last-child { border-bottom: 1px solid var(--line); }\n'
            '.trust b { display: block; margin-bottom: 4px; font-size: 22px; line-height: 1.2; font-weight: 450; font-stretch: 112%; letter-spacing: -0.03em; color: var(--fg); }', page)

# ---------- pricing ----------
page = sub1('<p class="text">Every plan gives you an Autonomous Organisation. The difference is who decides when it works. Prices in USD; credits pay for the work your departments do.</p>',
            '<p class="text">Every plan gives you your own business, and M-World takes no cut of your sales. The difference is who decides when it works. Prices in USD.</p>', page)
page = sub1("Your organisation's full dashboard", 'Your business on one board', page)

# ---------- FAQ: the same words as the page ----------
for old, new in [
    ('<summary>How does an Autonomous Organisation work?</summary>', '<summary>How does M-World run my business?</summary>'),
    ('You follow every task, booking, order and credit in the dashboard.', 'You follow every task, booking, order and credit on your board.'),
    ('Your organisation recognises work that needs hands or judgment', 'Your business recognises work that needs hands or judgment'),
    ('Every booking shows up in your dashboard.', 'Every booking shows up on your board.'),
    ('Your organisation can order from suppliers', 'Your business can order from suppliers'),
    ('Other organisations on M-World can become your suppliers or your customers.', 'Other businesses on M-World can become your suppliers or your customers.'),
    ('On Fully-Autonomous the organisation runs continuously', 'On Fully-Autonomous your business runs continuously'),
    ('is enough to create your organisation, explore every department', 'is enough to create your business, explore every department'),
]:
    page = sub1(old, new, page)

# ---------- closing: the network ----------
page = sub1('<h2 class="h2" id="close-title">The co-founder you never got to hire</h2>',
            '<h2 class="h2" id="close-title">Your business, connected to every other</h2>', page)
page = sub1('<p class="text">You own the vision. Your organisation runs the execution.</p>',
            '<p class="text">Every business on M-World can buy from and sell to every other. The more businesses join, the more each one can do.</p>', page)
page = sub1('rel="noopener">Create your organisation</a>', 'rel="noopener">Build your business</a>', page)
PLACES = '''    // businesses placed on the globe, each linked to its neighbours: the network the page ends on
    const spin = st * .07;
    const pts = PLACES.map(p => { const lon = p.lon + spin, cl = Math.cos(p.lat); return { ...p, px: x + r * cl * Math.sin(lon), py: y - r * Math.sin(p.lat), z: cl * Math.cos(lon) }; });
    const vis = p => p.z > .12 && p.py < H - 8;
    ctx.save(); ctx.setLineDash([3, 4]); ctx.lineWidth = 1.4; ctx.strokeStyle = C.accent;
    for (const [i, j] of PLINKS) {
      const a = pts[i], b = pts[j]; if (!vis(a) || !vis(b)) continue;
      const mx = (a.px + b.px) / 2, my = (a.py + b.py) / 2, ox = mx - x, oy = my - y, ol = Math.hypot(ox, oy) || 1;
      ctx.globalAlpha = .8 * Math.min(1, Math.min(a.z, b.z) * 3);
      ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.quadraticCurveTo(mx + ox / ol * 26, my + oy / ol * 26, b.px, b.py); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.font = `500 12.5px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const p of pts) {
      if (!vis(p)) continue;
      const al = Math.min(1, p.z * 3), s = 5 + p.z * 3;
      ctx.globalAlpha = al; ctx.fillStyle = C.panel; ctx.strokeStyle = C.fg; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.rect(p.px - s, p.py - s, s * 2, s * 2); ctx.fill(); ctx.stroke();
      if (p.name && W >= 560) {
        const tw = ctx.measureText(p.name).width;
        const left = p.px + s + tw + 40 > W, lx = left ? p.px - s - 8 - tw - 20 : p.px + s + 8;
        ctx.beginPath(); ctx.roundRect(lx, p.py - 12, tw + 20, 24, 12);
        ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.line2; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = C.fg; ctx.fillText(p.name, lx + 10, p.py + 1);
      }
    }
    ctx.restore();
  };'''
page = sub1("    sphere(ctx, x, y, r, st, { flares: sfl, res: 36, cellMin: 6, clipH: H, alpha: .75 });\n  };",
            "    sphere(ctx, x, y, r, st, { flares: sfl, res: 36, cellMin: 6, clipH: H, alpha: .34 });\n" + PLACES, page)
page = sub1("  const sun = $('sunrise'); let SN, st = 0, nextF = 0; const sfl = [];",
            "  const sun = $('sunrise'); let SN, st = 0, nextF = 0; const sfl = [];\n"
            "  const PLACES = [{ lon: -1.05, lat: .78, name: 'Pet products' }, { lon: -.45, lat: 1.08 }, { lon: .2, lat: .72, name: 'Coffee subscription' }, { lon: .75, lat: 1.12 },\n"
            "    { lon: 1.15, lat: .62, name: 'Tutoring app' }, { lon: -.25, lat: .56 }, { lon: 1.8, lat: .9 }, { lon: -1.75, lat: .95 },\n"
            "    { lon: 2.5, lat: .72 }, { lon: -2.45, lat: .66, name: 'Courier' }, { lon: 3.05, lat: 1.0, name: 'Bakery' }, { lon: -2.9, lat: .8 }];\n"
            "  const PLINKS = [[0, 1], [0, 5], [1, 3], [2, 5], [2, 3], [3, 4], [4, 6], [6, 8], [8, 10], [10, 11], [11, 9], [9, 7], [7, 0], [2, 4], [1, 7]];", page)
page = sub1("if (st > nextF) { sfl.push({ ang: -Math.PI / 2 + (Math.random() - .5) * 1.6, t0: st, life: 3.4, col: sfl.length % 2 ? C.human : C.accent }); nextF = st + 2.4 + Math.random() * .8; }",
            "if (st > nextF) { sfl.push({ ang: -Math.PI / 2 + (Math.random() - .5) * 1.6, t0: st, life: 3.4, col: C.accent }); nextF = st + 3.2 + Math.random() * .8; }", page)

(root / 'index.html').write_text(page)
lines = page.split('\n')
head_end = next(i for i, l in enumerate(lines) if l.strip() == '<body>')
frag = '\n'.join(lines[head_end + 1:])
frag = frag[:frag.rindex('</body>')].rstrip('\n') + '\n'
(root / 'mworld-landing.html').write_text(frag)
print('v12 ok')
