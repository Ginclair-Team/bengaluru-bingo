# Bengaluru Pocket

A pocket console of small games about Bengaluru: its tiffin, traffic, parks, tech and quiz nights. A Ginhouse console by Ginclair. Four cartridges so far:

- **Bingo:** stamp 25 things you've actually done in the city, press CONTINUE, and share how native you are.
- **Which Side, Macha?:** five landmarks, five guesses. Which zone of the city is each one in?
- **Gundu:** a balcony pet on city time. Pick a cat, dog or bird, name it, feed it, walk it across the junction to the darshini, and send its postcard to a neighbour.
- **Gig Hunt:** three weeks to land a first gig in Bengaluru. Interview for listings, take your tiffin, learn a skill, and keep the rent paid. Save your stats as a file to share.

<img width="2400" height="3200" alt="bengaluru-bingo-poster" src="https://github.com/user-attachments/assets/fb3f5b3b-b0f4-4ef6-96e0-0f4ffdf0e3dd" />

- **Console:** a Y2K handheld, the **BENGALURU POCKET BP-01**, with an LCD, a D-pad, A, B, CONTINUE and MENU. Every control works from the keyboard too.
- **Cartridges:** each game is a cartridge that the console runs one at a time, from a home menu. Games share the same hardware, palette, pixel art and sound.
- **Pixel art everywhere.** Sprites are text grids drawn as inline SVG rects (`crispEdges`), in one fixed palette. No images, no icon fonts, no audio files. Sound is square-wave oscillators.
- **Private.** Your card lives in this browser (`localStorage`). Nothing personal is stored.

## Play

| Input | Keyboard | Does |
| --- | --- | --- |
| D-pad | Arrows / WASD | Move the cursor or the menu selection |
| A | Z / Space | Select, stamp or confirm |
| B | X / Backspace / Esc | Go back, or lift a stamp |
| CONTINUE | Enter | Go on, or see your score |
| MENU | Shift | Pause menu |
| Sound | M | Sound and haptics on or off |

Tapping works too: tap a menu row or a tile.

## Links

- `/` opens the console at the home menu.
- `/?g=bingo`, `/?g=which-side` and `/?g=gundu` open a cartridge straight away.
- `/card/[code]` shows a shared scorecard. `/journey/[a]/[b]` joins two cards. Old `?c=` and `?view=card` links still open Bingo.

## Layout

| Path | What it holds |
| --- | --- |
| `src/console/` | The console: the boot, the home menu, the key router, the device shell |
| `src/console/types.ts` | The `Cartridge` contract every game implements |
| `src/console/registry.ts` | The list of cartridges, in menu order |
| `src/console/device/` | The hardware: bezel, LCD, D-pad, keys, grille, overlays, boot |
| `src/games/bingo/` | Cartridge 1: rules, board, scorecards, sharing, clubbing, tile art |
| `src/games/bingo/index.ts` | Bingo's cartridge entry (title, sticker, legends, icon) |
| `src/games/bingo/rules.ts` | Scoring, bingo lines, share codes |
| `src/games/bingo/tiles.json` | The 25 tiles: labels, categories, blurbs |
| `src/games/bingo/cards/` | Scorecard generator and the six avatar scenes |
| `src/games/bingo/illustrator/` | The 16 x 16 tile sprites |
| `src/games/which-side/` | Cartridge 2: Which Side, Macha? (landmarks, zones, rounds, stats) |
| `src/games/gundu/` | Cartridge 3: Gundu (cat, dog or bird; needs, walks, decor, visit codes) |
| `src/games/gig-hunt/` | Cartridge 4: Gig Hunt (listings, interviews, tiffin, rent, stats file) |
| `src/lib/` | Pixel-sprite renderer and sound (shared by every game) |
| `src/app/` | Routes: the console, shared cards, journeys, API |
| `DESIGN.md` | The design system, including the console and cartridge platform (section 12) |

## Add a game

1. Create `src/games/<id>/` with your screens and rules. Keep them inside the cartridge.
2. Export a `Cartridge` from `src/games/<id>/index.ts` (see `src/console/types.ts`): title, tagline, sticker (16 characters at most), a 16 x 16 icon, the A and B legends, and the `Game` component.
3. Inside the game, use `useCartridge()` for the console host (`transition`, `announce`, `flashLed`, `setGrille`, `exit`, sound) and `useConsoleKeys(handler)` for the D-pad, A, B, CONTINUE and MENU.
4. Add it to `CARTRIDGES` in `src/console/registry.ts`.

Keys, the wipe between screens, the boot, the sound setting and the menu all come from the console, so a new game gets them for free.

## Develop

```
npm install
npm run dev
```

Open http://localhost:3000. No keys or database are needed. Fonts (Press Start 2P, Silkscreen, Pixelify Sans) load through `next/font/google`.

To check the production build locally: `npm run build`, then `npm start`.

## Deploy to Vercel

Push to GitHub, import the repo at [vercel.com/new](https://vercel.com/new), and deploy. `vercel.json` sets the build, install and dev commands. Next.js is detected automatically and no environment variables are required.

## Optional: Supabase

`POST /api/scores` stores finished rounds once a database is connected. Until then it answers `stored: false`. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and run `db/schema.sql` in the Supabase SQL editor.
