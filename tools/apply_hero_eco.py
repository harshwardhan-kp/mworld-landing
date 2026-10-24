"""Splice the ecosystem hero and the new type system into index.html, then regenerate mworld-landing.html.

Usage: python3 tools/apply_hero_eco.py   (run from the repo root; idempotent only on the pre-v11 page)
"""
import re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'
page = (root / 'index.html').read_text()

def sub1(old, new, s, count=1):
    if old not in s:
        raise SystemExit(f'missing: {old[:70]!r}')
    return s.replace(old, new, count)

# ---------- fonts: Archivo (width + weight axes) and JetBrains Mono for the ASCII art (it carries the box-drawing glyphs) ----------
page = sub1('family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap',
            'family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400..600&display=swap', page)
page = sub1('--font-sans: "Geist", ui-sans-serif', '--font-sans: "Archivo", ui-sans-serif', page)
page = sub1('--font-mono: "Geist Mono", ui-monospace', '--font-mono: "JetBrains Mono", ui-monospace', page)
page = sub1("const MONO = '\"Geist Mono\", ui-monospace, Menlo, monospace';", "const MONO = '\"JetBrains Mono\", ui-monospace, Menlo, monospace';", page)
page = page.replace('`600 100px Geist, sans-serif`', '`expanded 600 100px Archivo, sans-serif`')
page = page.replace('`600 ${fs}px Geist, sans-serif`', '`expanded 600 ${fs}px Archivo, sans-serif`')

# ---------- type scale: wide, light display; plain text width for reading ----------
page = sub1('h1, h2, h3 { font-weight: 500; text-wrap: balance; }',
            'h1, h2, h3 { font-weight: 400; font-stretch: 125%; text-wrap: balance; }', page)
page = sub1('.h1 { font-size: clamp(56px, 8.4vw, 116px); line-height: .9; letter-spacing: -0.058em; margin-left: -0.05em; }',
            '.h1 { font-size: clamp(52px, 8vw, 112px); line-height: .92; letter-spacing: -0.06em; margin-left: -0.05em; font-weight: 300; }', page)
page = sub1('.h2 { font-size: clamp(36px, 4.6vw, 62px); line-height: 1; letter-spacing: -0.048em; }',
            '.h2 { font-size: clamp(32px, 4vw, 54px); line-height: 1.02; letter-spacing: -0.05em; font-weight: 320; }', page)
page = sub1('.statement { font-size: clamp(24px, 2.3vw, 32px); line-height: 1.12; letter-spacing: -0.03em; font-weight: 500; }',
            '.statement { font-size: clamp(22px, 2.1vw, 29px); line-height: 1.16; letter-spacing: -0.035em; font-weight: 400; font-stretch: 112%; }', page)
page = sub1('.label { font: 500 13px/1 var(--font-mono); color: var(--muted); }',
            '.label { font: 500 13px/1 var(--font-sans); font-stretch: 88%; color: var(--muted); }', page)
page = sub1('.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font: 600 20px/1 var(--font-sans); letter-spacing: -0.02em; }',
            '.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font: 560 20px/1 var(--font-sans); font-stretch: 125%; letter-spacing: -0.04em; }', page)
page = sub1('.actor h3 { font-size: 24px; letter-spacing: -0.025em;', '.actor h3 { font-size: 23px; letter-spacing: -0.04em; font-weight: 420;', page)
page = sub1('.plan h3 { font-size: 24px; letter-spacing: -0.02em; }', '.plan h3 { font-size: 22px; letter-spacing: -0.04em; font-weight: 420; }', page)
page = sub1('.price b { font: 500 62px/1 var(--font-sans); letter-spacing: -0.05em; }',
            '.price b { font: 300 62px/1 var(--font-sans); font-stretch: 125%; letter-spacing: -0.06em; }', page)
page = sub1('.fact .big { font: 500 32px/1.1 var(--font-sans); letter-spacing: -0.035em;',
            '.fact .big { font: 340 32px/1.1 var(--font-sans); font-stretch: 125%; letter-spacing: -0.05em;', page)
page = sub1('.dpanel small { font: 500 13px/1.4 var(--font-mono);', '.dpanel small { font: 500 13px/1.4 var(--font-sans); font-stretch: 88%;', page)
page = sub1('.wm-hint { position: absolute; right: 14px; bottom: 10px; display: flex; gap: 8px; align-items: baseline; font: 500 11.5px/1 var(--font-mono);',
            '.wm-hint { position: absolute; right: 14px; bottom: 10px; display: flex; gap: 8px; align-items: baseline; font: 500 12px/1 var(--font-sans); font-stretch: 88%;', page)
page = sub1('.files { font: 500 13px/1 var(--font-mono);', '.files { font: 500 13px/1 var(--font-sans);', page)
page = sub1('.email a { font: 500 24px/1.1 var(--font-sans); letter-spacing: -0.03em;', '.email a { font: 400 24px/1.1 var(--font-sans); font-stretch: 112%; letter-spacing: -0.04em;', page)
page = sub1('.video .vb b { font: 500 20px/1.2 var(--font-sans); letter-spacing: -0.01em; }', '.video .vb b { font: 450 20px/1.2 var(--font-sans); font-stretch: 112%; letter-spacing: -0.03em; }', page)
page = sub1('.faq summary { list-style: none; cursor: pointer; padding: 20px var(--pad); display: grid; grid-template-columns: minmax(0, 1fr) 16px; gap: 16px; align-items: center; font-weight: 500; font-size: 20px; letter-spacing: -0.015em; }',
            '.faq summary { list-style: none; cursor: pointer; padding: 20px var(--pad); display: grid; grid-template-columns: minmax(0, 1fr) 16px; gap: 16px; align-items: center; font-weight: 450; font-size: 20px; font-stretch: 106%; letter-spacing: -0.025em; }', page)
page = sub1('.lede b { font-weight: 500; color: var(--fg); }', '.lede b { font-weight: 600; color: var(--fg); }', page)

# ---------- hero copy: say what M-World is in plain words ----------
page = re.sub(r'<p class="text lede">.*?</p>',
              '<p class="text lede"><b>You own it. AI runs it. People do what only people can.</b> Describe your idea and M-World turns it into a business that runs itself, connected to every other business on M-World.</p>',
              page, count=1, flags=re.S)

# ---------- hero centrepiece: the orbit becomes the ecosystem story ----------
page, n = re.subn(r'      <div class="orbit-wrap" id="orbitWrap">.*?</p>\n      </div>\n', (src / 'hero-eco.html').read_text(), page, count=1, flags=re.S)
assert n == 1, 'orbit markup'
page, n = re.subn(r'/\* orbit \*/.*?@media \(max-width: 860px\) \{\n  \.hero-main \.cell \{ grid-template-columns: 1fr; min-height: 0; \}\n  \.hero-l \{ padding: 40px var\(--pad\) 36px; gap: 22px; \}\n.*?\n\}\n',
                  lambda m: (src / 'hero-eco.css').read_text() + '@media (max-width: 860px) {\n  .hero-main .cell { grid-template-columns: 1fr; min-height: 0; }\n  .hero-l { padding: 40px var(--pad) 36px; gap: 22px; }\n}\n',
                  page, count=1, flags=re.S)
assert n == 1, 'orbit css'
page = sub1('  .live i { animation: none; }\n', '', page)
start = page.index('  // ================= ORBIT CENTREPIECE')
end = page.index('  // ================= HOW: prompt')
page = page[:start] + (src / 'hero-eco.js').read_text() + page[end:]

page = sub1('buildMask(); draw(); treeGeo(); });', 'buildMask(); layoutWires(); drawSphere(); treeGeo(); });', page)
(root / 'index.html').write_text(page)

# ---------- the artifact fragment: the same page without the html/head/body skeleton ----------
lines = page.split('\n')
head_end = next(i for i, l in enumerate(lines) if l.strip() == '<body>')
frag = '\n'.join(lines[head_end + 1:])
frag = frag[:frag.rindex('</body>')].rstrip('\n') + '\n'
(root / 'mworld-landing.html').write_text(frag)
print('ok', len(page), len(frag))
