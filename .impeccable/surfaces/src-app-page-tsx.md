---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Game view (home)

Scope: the playable bingo card at `/`, its flip side (the scorecard), and the shared card and journey pages that reuse both. Visitor mode: Experience. The board is the work; chrome recedes.

Audience and job: anyone who knows Bengaluru, on a phone, two minutes: stamp what you have done, flip, post the card. Constraints: local-first, no PII, AA contrast in every season, light on 4G.

## Direction contract

THESIS: The screen is one physical card. Front is a printed bingo board you stamp; back is your trading card. It refuses the quiz-app arrangement of a question list, progress bar and result modal.

OWN-WORLD: Owner's two references, fused. A riso-printed board in the season's colour on a flat pastel ground, pale paper tiles, grid lines made by the board showing through, two-word tile labels in condensed mono caps, rubber-stamp smileys in a contrasting ink set at uneven angles. Characters and the scorecard follow the Tangz trading-card grammar: uniform thick black outline, flat fills, coloured frame, name and stars up top, stat boxes, card number. No shadows, no blur.

STORY: Recognise the tiles, stamp them, watch the count climb, flip the card, see a badge and a percentage, send it, then club cards with a friend.

FIRST VIEWPORT: Small Ginhouse wordmark and season switch on one line. Then the board at near full width, 5:7, BINGO set one letter per column above the 5x5 grid, city line at its foot. Under it a one-tile detail strip; pinned to the bottom, the count and the single action, "Flip for my scorecard".

FORM: Pinned by the owner's spec and reference images. seed: none (pinned) "Retro Bingo structure meets Vibrant Tangz Illustration style", "rigid, grid-based layout of Image 1 for the core game view (5x5 Grid)", "scorecard must resemble a digital postcard (Image 2 format)". Signature interaction: the stamp landing on a tile. Motion grammar: weighty springs; tiles settle in once on load, the card flips on its vertical axis between board and scorecard.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
