"""Warm paper pass: blue ink on warm paper, a fine grain over the page, orange flakes in the popular plan.

Run after apply_hero_eco.py:  python3 tools/apply_warm.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
page = (root / 'index.html').read_text()

def sub1(old, new, s):
    if old not in s:
        raise SystemExit(f'missing: {old[:70]!r}')
    return s.replace(old, new, 1)

# ---------- palette: the cool blue-greys become paper and pencil; the brand blue stays as the ink ----------
TOKENS = {
    '--bg': '#F5F0E6',          # warm paper
    '--panel': '#FBF8F2',       # a lighter sheet laid on top
    '--sunk': '#EBE3D5',
    '--fg': '#1B1813',          # warm black ink
    '--ink-2': '#332E26',
    '--muted': '#6B6255',
    '--faint': '#9B907F',
    '--line': '#E2D8C6',
    '--line-2': '#CDBFA8',
    '--accent': '#2177F2',      # the brand blue, a touch deeper so it reads as ink on paper
    '--accent-2': '#5CB8F5',
    '--accent-soft': '#E4E8EC',
    '--accent-deep': '#1468E0',
    '--accent-ink': '#0B56C4',
    '--human': '#E0700B',
    '--human-ink': '#984A00',
    '--human-soft': '#F9E6CC',
    '--human-line': '#E0700B73',
    '--human-2': '#F3A24A',
    '--human-deep': '#B4570A',
    '--block': '#1561D6',
    '--on-block': '#FFFDF8',
    '--night': '#17130E',       # the closing section: night on paper, not navy
    '--night-ink': '#F4E7D2',
    '--night-ring': '#F3A24A38',
    '--shadow': '#3A28101A',
    '--shadow-2': '#3A281040',
    '--glow': '#2177F28C',
    '--iso-l': '#EDE5D7',
    '--iso-r': '#DCD0BC',
    '--iso-edge': '#C2B39B',
    '--iso-ink-t': '#3F382D',
    '--iso-ink-r': '#2A251D',
}
for k, v in TOKENS.items():
    page, n = re.subn(rf'(\n  {re.escape(k)}: )#[0-9A-Fa-f]{{6,8}};', rf'\g<1>{v};', page, count=1)
    if n != 1:
        raise SystemExit('token ' + k)

# ---------- grain: a fixed sheet of fine noise multiplied over everything, like uncoated stock ----------
GRAIN = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E"
         "%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E"
         "%3CfeColorMatrix values='0 0 0 0 .42 0 0 0 0 .33 0 0 0 0 .2 0 0 0 1.6 -.62'/%3E%3C/filter%3E"
         "%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")
FIBRE = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='900'%3E"
         "%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.004 .02' numOctaves='2' seed='7' stitchTiles='stitch'/%3E"
         "%3CfeColorMatrix values='0 0 0 0 .55 0 0 0 0 .42 0 0 0 0 .25 0 0 0 .22 -.07'/%3E%3C/filter%3E"
         "%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")
css = f"""
/* ---------- paper ---------- */
/* fine grain over everything (multiplied, so ink and panels pick it up too), and long soft fibres in the sheet itself */
body {{ background-color: var(--bg); background-image: url("{FIBRE}"); background-size: 900px 900px; }}
body::after {{ content: ""; position: fixed; inset: 0; z-index: 60; pointer-events: none; background-image: url("{GRAIN}"); background-size: 240px 240px; mix-blend-mode: multiply; opacity: .32; }}
.nav {{ background: color-mix(in srgb, var(--bg) 94%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }}
@media print {{ body::after {{ display: none; }} }}
"""
page = sub1('\n@media (prefers-reduced-motion: reduce) {', css + '\n@media (prefers-reduced-motion: reduce) {', page)

# ---------- the popular plan: orange flakes drifting on a warm sheet ----------
page = sub1('.plan.pop { background: var(--accent-soft);', '.plan.pop { background: var(--human-soft);', page)
page = sub1('// ================= POPULAR PLAN: ASCII snow drifting through the card =================',
            '// ================= POPULAR PLAN: orange ASCII flakes drifting through the card =================', page)
page = sub1("ctx.fillStyle = f.z > .78 ? C.accent : C.accent2;", "ctx.fillStyle = f.z > .78 ? C.human : f.z > .4 ? C.human2 : C.humanLine;", page)
page = sub1("ctx.fillStyle = shim ? C.accent : C.accent2;", "ctx.fillStyle = shim ? C.accent : C.human2;", page)
page = sub1("accent2: g('--accent-2'),", "accent2: g('--accent-2'), human2: g('--human-2'),", page)

(root / 'index.html').write_text(page)
lines = page.split('\n')
head_end = next(i for i, l in enumerate(lines) if l.strip() == '<body>')
frag = '\n'.join(lines[head_end + 1:])
frag = frag[:frag.rindex('</body>')].rstrip('\n') + '\n'
(root / 'mworld-landing.html').write_text(frag)
print('warm ok')
