# M-World landing page

The redesigned landing page for [mworld.tech](https://mworld.tech): one prompt becomes an Autonomous Organisation whose AI departments, people in the loop and partner businesses run the work.

Light theme in the M-World brand blues, a blueprint frame (rails, hairlines, crosshairs), and ASCII art in a few deliberate places.

## Open it

Open `index.html` in a browser. It is self-contained: one HTML file with inline CSS and JS, Google Fonts (Geist, Geist Mono) as the only external request.

`mworld-landing.html` is the same page without the `<html>/<head>/<body>` skeleton. It is the source used for the Claude artifact preview.

## What is on the page

- **Hero**: "Describe a business." with the prompt box (auto-typing demo, Fully/Semi toggle, example sprints), beside the centrepiece: an ASCII sphere core with three orbits in 3D, like a gyroscope. AI departments ride the equator, people a +45° great circle, businesses a −45° great circle. Tasks pulse out from the core and back.
- **Who does the work**: prompt → AO globe → dashboard, then three isometric SVG miniatures: the tower (AI departments), the handoff (people in the loop), the district (businesses trading with each other).
- **Departments**: the blue field with an ASCII org chart and department tabs.
- **What is an Autonomous Organisation**: comparison table and the intro video link.
- **Pricing**: Starter, Semi-Autonomous ($10), Fully-Autonomous ($30) with an animated ASCII black hole.
- **FAQ, closing sunrise, contact, footer** with the "paint the word" ASCII wordmark (stroke the letters to paint them blue; finish the word and it resets).

## Folders

| Path | What it holds |
| --- | --- |
| `index.html` | The page, ready to open. |
| `mworld-landing.html` | The page as an artifact fragment. |
| `versions/` | Every saved iteration, v2 to v10, for comparison. |
| `src/` | The art modules as written before they were spliced into the page: `iso.js` (isometric miniatures), `wordmark.js` (paint the word), `blackhole.js` (pricing black hole). The page holds the current versions. |
| `tools/` | Playwright screenshot scripts used for visual review, and `blackhole-test.html`, a harness for the black hole. The scripts expect Chromium at `/opt/pw-browsers/chromium` and take the HTML path as an argument. |
| `screenshots/` | Review screenshots: before and after the length pass (v3), the hero redesign, the pricing card, and full-page captures. |

## Before launch

- Swap the "M" placeholder mark for the real logo.
- Embed the YouTube video where the page links out to it.
- Connect the contact form; it validates and shows a preview note today.
- Confirm the illustrative content: sample sprint tasks, the example dashboard numbers (142 / 600 credits), "goal: first 100 customers", and the people and business names in the miniatures.
- Confirm the FAQ answers and the network claims (booking people, businesses trading on the network) match the product.

## Credits

Design review used [taste-skill](https://github.com/Leonxlnx/taste-skill) by Leonxlnx (MIT) as a reference. It is not vendored here.
