# M-World landing page

The redesigned landing page for [mworld.tech](https://mworld.tech): one prompt becomes an Autonomous Organisation whose AI departments, people in the loop and partner businesses run the work.

Blue ink on warm paper: the M-World brand blue on a warm off-white sheet with a fine grain, a blueprint frame (rails, hairlines, crosshairs), and ASCII art in a few deliberate places. Type is Archivo throughout: wide and light (125% width) for headings, normal width for reading, with Martian Mono only for the ASCII art.

## Open it

Open `index.html` in a browser. It is self-contained: one HTML file with inline CSS and JS, Google Fonts (Archivo, Martian Mono) as the only external request.

`mworld-landing.html` is the same page without the `<html>/<head>/<body>` skeleton. It is the source used for the Claude artifact preview.

## What is on the page

- **Hero**: "Describe a business." with the prompt box (auto-typing demo, Fully/Semi toggle, example prompts), beside the centrepiece: how M-World works in five steps. You bring the idea → your business (the ASCII sphere and its six AI departments) runs it → it hires people → it trades with other businesses → the profit comes back to you. Steps advance on their own, hold while hovered, and can be clicked; the example changes each loop. The v10 orbit is kept in `versions/mworld-landing.v10.html`.
- **Who does the work**: prompt → AO globe → dashboard, then three isometric SVG miniatures: the tower (AI departments), the handoff (people in the loop), the district (businesses trading with each other).
- **Departments**: the blue field with an ASCII org chart and department tabs.
- **What is an Autonomous Organisation**: comparison table and the intro video link.
- **Pricing**: Starter, Semi-Autonomous ($10), Fully-Autonomous ($30) with orange ASCII flakes drifting through the popular plan and gathering along its floor; the pointer blows them about.
- **Micro-interactions**: a ripple from the point of every press, springy hover and press states, pop-ins for chips, toggles and tabs, a settle-in for changed text, scroll reveals, a nav that underlines the section being read, a shaking field for form errors, and the pinwheel logo turning on hover. All of it turns off under reduced motion.
- **FAQ, closing sunrise, contact, footer** with the "paint the word" ASCII wordmark (stroke the letters to paint them blue; finish the word and it resets).

## Folders

| Path | What it holds |
| --- | --- |
| `index.html` | The page, ready to open. |
| `mworld-landing.html` | The page as an artifact fragment. |
| `versions/` | Every saved iteration, v2 to v10, for comparison. |
| `src/` | `hero-eco.html/.css/.js`, the ecosystem hero spliced in by `tools/apply_hero_eco.py`, and the art modules as written before they were spliced into the page: `iso.js` (isometric miniatures), `wordmark.js` (paint the word), `snowfall.js` (pricing snowfall). The page holds the current versions. |
| `tools/` | `build.sh` rebuilds the page from `main` with `apply_hero_eco.py` (hero + type) and `apply_warm.py` (paper palette, grain, flakes). Also Playwright screenshot scripts used for visual review, and `snowfall-test.html`, a harness for the snowfall. The scripts expect Chromium at `/opt/pw-browsers/chromium` and take the HTML path as an argument. |
| `screenshots/` | Review screenshots: before and after the length pass (v3), the hero redesign, the pricing card, and full-page captures. |

## Before launch

- Embed the YouTube video where the page links out to it.
- Connect the contact form; it validates and shows a preview note today.
- Confirm the illustrative content: sample sprint tasks, the example dashboard numbers (142 / 600 credits), "goal: first 100 customers", and the people and business names in the miniatures.
- Confirm the FAQ answers and the network claims (booking people, businesses trading on the network) match the product.

## Credits

Design review used [taste-skill](https://github.com/Leonxlnx/taste-skill) by Leonxlnx (MIT) as a reference. It is not vendored here.
