# bengaluru-bingo

Bengaluru Bingo, a Ginhouse game by Ginclair. A 5x5 card of 25 Bengaluru experiences, played on a Y2K handheld: the **GINHOUSE BINGO GH-26**.

<img width="2400" height="3200" alt="bengaluru-bingo-poster" src="https://github.com/user-attachments/assets/fb3f5b3b-b0f4-4ef6-96e0-0f4ffdf0e3dd" />

- **Play** on the colour LCD. Tap a tile, or drive it with the hardware: D-pad (arrows / WASD), A (Z / Space) to stamp, B (X / Backspace / Esc) to go back, START (Enter) for your scorecard, SELECT (Shift) for the menu, M to mute.
- **Pixel art everywhere.** Tile characters, the stamp badge, icons and the scorecard are inline SVG rects on a pixel grid (`crispEdges`), drawn in one fixed palette. No images, no icon fonts, no audio files (sound is square-wave oscillators, mute is stored in `localStorage` as `bb:sound`).
- **One fixed palette.** All colours are CSS custom properties on `:root` in `src/app/globals.css` (see `DESIGN.md`). There are no seasons or theme switches.
- **The device** lives in `src/components/device/*` and scales as one object: everything is measured in `u`, where `1u` is the device width / 344.
- Your card lives in this browser (`localStorage`); nothing personal is stored. Share links are `/card/[code]`, and two cards join into a `/journey/[a]/[b]` "link cable" page.

## Develop

```
npm install
npm run dev
```

Fonts (Press Start 2P, Silkscreen, Pixelify Sans) load through `next/font/google`.
