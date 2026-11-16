---
name: Bengaluru Bingo
description: A Y2K pocket console running one game. Stamp 25 Bengaluru tiles on the LCD, press START for your scorecard. A Ginhouse game.
colors:
  desk: "#2A1E5C"
  desk-2: "#35277A"
  desk-shadow: "#150E36"
  desk-ink: "#FFF6D6"
  desk-dim: "#C9BEF5"
  shell: "#19C2B8"
  shell-hi: "#7FF0E4"
  shell-lo: "#0E8C88"
  shell-edge: "#0A4F52"
  shell-ink: "#042B2D"
  bezel: "#1A1C2C"
  bezel-hi: "#3A3D5C"
  bezel-ink: "#E4EDC2"
  lcd-off: "#59663F"
  lcd-ink: "#1A1C2C"
  lcd-dim: "#4B5B5A"
  lcd-mid: "#A9BC8F"
  lcd-paper: "#E4EDC2"
  lcd-white: "#F8FBE8"
  lcd-stamped: "#FFD23F"
  stamp: "#C2185B"
  cursor: "#FF2E88"
  btn-ab: "#FF2E88"
  btn-ab-hi: "#FF8CC0"
  btn-ab-lo: "#B0125A"
  btn-dark: "#2B2D42"
  btn-dark-hi: "#4A4E69"
  btn-dark-lo: "#14151F"
  btn-pill: "#FFD23F"
  btn-pill-hi: "#FFF0A8"
  btn-pill-lo: "#C79A00"
  led-on: "#B6FF3C"
  led-off: "#3F5A1A"
  focus: "#FFD23F"
  cat-food: "#FFD23F"
  cat-commute: "#FF8A3D"
  cat-outdoors: "#3CC47C"
  cat-hustle: "#B594F5"
  cat-scene: "#FF6FB5"
  cat-none: "#FFE9C4"
typography:
  display:
    fontFamily: "Press Start 2P, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.25
  label:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "8px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  ui:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  body:
    fontFamily: "Pixelify Sans, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: "0px"
  shell: "32px"
  bezel: "14px"
spacing:
  pixel: "4px"
  gutter: "8px"
  panel: "16px"
  column-gap: "56px"
components:
  button:
    backgroundColor: "{colors.lcd-paper}"
    textColor: "{colors.lcd-ink}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "48px"
  button-primary:
    backgroundColor: "{colors.btn-pill}"
    textColor: "{colors.lcd-ink}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "48px"
  panel:
    backgroundColor: "{colors.lcd-paper}"
    textColor: "{colors.lcd-ink}"
    rounded: "{rounded.none}"
    padding: "16px"
  tile:
    backgroundColor: "{colors.lcd-paper}"
    textColor: "{colors.lcd-ink}"
    rounded: "0px"
---

# Design System: Bengaluru Bingo

## 1. Concept

**Creative North Star: "One pocket console, one cartridge."**

The whole product is a handheld from the year 2000 lying on a desk: the **GINHOUSE POCKET GH-25** (25 for the 25 tiles), in translucent "Jelly Teal" plastic, with *Bengaluru Bingo* as the cartridge that's always in it. The game is played on its colour LCD. You can tap the screen directly, or drive it with the hardware: D-pad, A, B, START, SELECT. Everything on the LCD is pixel art.

Mood: candy plastic, chunky hard bevels, sticker labels, blinking cursors, 8-bit blips. Friendly, a little silly, fast.

- **One fixed palette.** No seasons, no month logic, no theme switch. Delete the season engine (`src/theme/*`, `SeasonSwitch`, `SeasonalScorecard` becomes a plain scorecard wrapper, `scorecardSvg` loses its `season` argument, `/api/scores` stops sending `season`).
- **Original hardware.** Not a replica of any real console: symmetric shell, octagonal A/B keys, disc D-pad, a 5x5 speaker grille that doubles as a stamp map.
- **Hard pixels only.** No blur, no soft shadows, no gradients except the two-band LCD scanline texture.

## 2. Palette

All tokens are CSS custom properties on `:root`. Components use the variable, never the hex.

### Desk (page)
| Token | Hex | Use |
|---|---|---|
| `--desk` | `#2A1E5C` | Page background |
| `--desk-2` | `#35277A` | 8px checker pattern over the desk (`repeating-conic-gradient`, 16px tile) |
| `--desk-shadow` | `#150E36` | Hard drop shadow under device and panels |
| `--desk-ink` | `#FFF6D6` | Headings and body on the desk (14.0:1 on `--desk`) |
| `--desk-dim` | `#C9BEF5` | Secondary text on the desk (8.7:1) |

### Shell (plastic)
| Token | Hex | Use |
|---|---|---|
| `--shell` | `#19C2B8` | Shell body. Applied as `rgb(25 194 184 / 0.9)` so the desk checker ghosts through |
| `--shell-hi` | `#7FF0E4` | 4px top/left inner bevel |
| `--shell-lo` | `#0E8C88` | 4px bottom/right inner bevel |
| `--shell-edge` | `#0A4F52` | 3px outer outline of the shell |
| `--shell-ink` | `#042B2D` | Legends printed on the shell (5.7:1 on the composited shell) |

Translucency treatment: three layers inside the shell, back to front. (1) the 0.9 alpha fill; (2) a "circuit board" SVG pattern (1px-wide right-angle traces and 3px square pads, `#FFFFFF` at 10% opacity, 48px tile) clipped to the shell; (3) one diagonal hard-edged gloss stripe: a 28u-wide band of `#FFFFFF` at 14% from the top-left corner, at 45deg, no blur. Legends must never sit on the gloss stripe.

### Bezel and LCD
| Token | Hex | Use |
|---|---|---|
| `--bezel` | `#1A1C2C` | Screen surround |
| `--bezel-hi` | `#3A3D5C` | 2px inner bevel line of the bezel |
| `--bezel-ink` | `#E4EDC2` | Text on the bezel (13.7:1) |
| `--lcd-off` | `#59663F` | Unpowered screen (boot frame 0) |
| `--lcd-ink` | `#1A1C2C` | All LCD text, borders, sprite outline |
| `--lcd-dim` | `#4B5B5A` | Secondary LCD text (5.9:1 on paper) |
| `--lcd-mid` | `#A9BC8F` | Grid lines, disabled rows, dividers |
| `--lcd-paper` | `#E4EDC2` | Screen background, unstamped tile |
| `--lcd-white` | `#F8FBE8` | Hover tile, dialog fill, flash frame |
| `--lcd-stamped` | `#FFD23F` | Stamped tile fill (ink text 11.6:1) |
| `--stamp` | `#C2185B` | Stamp badge, bingo banner fill (white text 6.3:1) |
| `--cursor` | `#FF2E88` | Cursor brackets (decorative; always paired with an ink bracket) |

### Hardware
| Token | Hex | Use |
|---|---|---|
| `--btn-ab` / `-hi` / `-lo` | `#FF2E88` / `#FF8CC0` / `#B0125A` | A and B keys: face, top bevel, side wall. Letter in `--lcd-ink` (5.0:1) |
| `--btn-dark` / `-hi` / `-lo` | `#2B2D42` / `#4A4E69` / `#14151F` | D-pad disc and cross. Arrows in `--bezel-ink` |
| `--btn-pill` / `-hi` / `-lo` | `#FFD23F` / `#FFF0A8` / `#C79A00` | START, SELECT, and primary page buttons. Text in `--lcd-ink` |
| `--led-on` / `--led-off` | `#B6FF3C` / `#3F5A1A` | Power LED |
| `--focus` | `#FFD23F` | Focus ring, always doubled (see Focus) |

### Category colours (scorecard frame, chips, journey headers)
`--cat-food #FFD23F`, `--cat-commute #FF8A3D`, `--cat-outdoors #3CC47C`, `--cat-hustle #B594F5`, `--cat-scene #FF6FB5`, `--cat-none #FFE9C4`. Ink text on every one is at least 6:1. Update `CATEGORIES[*].color` in `src/lib/game.ts` to these.

### Contrast rules
- Text on the LCD is only ever `--lcd-ink` or `--lcd-dim` on paper/white/stamped, `--lcd-paper` on ink, or `#FFFFFF` on `--stamp`.
- Never put white text on `--btn-ab` or `--cursor` pink (3.4:1). Use ink.
- The scanline overlay is capped at 6% ink so pairs above stay over 4.5:1.

### Focus
`outline: 3px solid var(--lcd-ink); box-shadow: 0 0 0 6px var(--focus);` on every focusable element, `:focus-visible` only. The ink-plus-yellow double ring holds 3:1 on desk, shell, bezel and LCD alike. Tiles use the cursor (below) as their focus indicator plus an inset 2px ink outline.

## 3. Typography

Three Google Fonts via `next/font/google`, `display: "swap"`, latin subset, exposed as `--font-display`, `--font-ui`, `--font-body`.

| Role | Font | Why |
|---|---|---|
| Display | **Press Start 2P** (400) | The arcade face. Wide and loud, so it is used only for a few characters at a time: B I N G O, the percentage, badge names, button letters. Never for sentences. |
| UI / label | **Silkscreen** (400, 700) | Caps-only bitmap face that stays crisp at 8px. Tile labels, menus, legends, buttons. |
| Body | **Pixelify Sans** (400, 600) | A pixel face with real lowercase and even rhythm. The only font allowed for sentences: blurbs, instructions, journey lists. |

Sizes. `u` is the device unit (section 4). Use `max()` so nothing drops under the floor.

| Token | Font | Size | Tracking | Where |
|---|---|---|---|---|
| `display-xl` | Press Start 2P | 28px mobile, 40px desktop | 0 | Page H1 on card, journey and 404 pages |
| `display-l` | Press Start 2P | 16px | 0 | Dialog titles, A/B key letters, result percent on LCD |
| `display-s` | Press Start 2P | `max(10px, 12u)` | 0 | B I N G O column letters, counter `17/25` |
| `ui-l` | Silkscreen 700 | 16px | 0.02em | Page buttons, menu rows |
| `ui-s` | Silkscreen 700 | `max(8px, 9u)` | 0.04em | Shell legends (START, SELECT, PWR), bezel sticker |
| `label` | Silkscreen 400 | `max(8px, 8u)` | 0 | Tile labels, soft-key hints |
| `body` | Pixelify Sans 400 | 16px, line-height 1.4 | 0 | Page paragraphs, journey lists |
| `body-lcd` | Pixelify Sans 400 | `max(12px, 12u)`, line-height 1.2 | 0 | Tile blurb in the info bar, help text |
| `body-strong` | Pixelify Sans 600 | same as context | 0 | Tile name in the info bar, emphasis |

All Silkscreen and Press Start 2P text is uppercase. Apply `-webkit-font-smoothing: none; font-smooth: never; text-rendering: optimizeSpeed` to those two faces.

## 4. Device anatomy and layout

### Unit and sizing
The device is one container with a fixed aspect ratio of **344 : 632**. Everything inside is measured in `u`, where `1u = device width / 344`. Implement as `container-type: inline-size` and `--u: calc(100cqw / 344)`.

```
device width = clamp(328px, min(100vw - 16px, (100dvh - 24px) * 0.544), 440px)
```

- 360px phone: device 344 x 632 (u = 1). 390px phone: 374 x 687 (u = 1.09).
- Short viewports shrink the device (floor 328px, tiles 53px) before the page scrolls.
- Desktop: capped at 440 x 808 (u = 1.28).
- Tiles are 56u, so they are never under 53px. All hardware keys have hit areas of at least 44px.

### Top to bottom (u, origin at the shell's top-left)

| Part | Box (x, y, w, h) | Detail |
|---|---|---|
| Shell | 0, 0, 344, 632 | Radius 32u on all four corners. 3px `--shell-edge` outline, 4px hi/lo inset bevels, hard shadow `8px 8px 0 var(--desk-shadow)`. |
| Lanyard notch | 20, 0, 28, 6 | A `--shell-edge` slot cut into the top edge. Decorative. |
| Bezel | 14, 14, 316, 416 | `--bezel`, radius 14u, 2px `--bezel-hi` inner line. |
| Bezel top strip | 14, 14, 316, 22 | Left: power LED (6u square, at x 28) + `PWR` in `ui-s`. Centre: `GINHOUSE POCKET` in `ui-s`. Right: sound toggle, an 8x8 speaker icon (crossed when muted); 44px hit area centred on it. |
| LCD | 26, 36, 292, 368 | `--lcd-paper`. Square corners. Scanline overlay on top (pointer-events none). |
| Bezel bottom strip | 14, 404, 316, 26 | Centred sticker: `--lcd-stamped` rectangle 150 x 16u with `BENGALURU BINGO` in `ui-s` ink, tilted 0deg (no rotation). Right end: `GH-25` in `--bezel-ink`. |
| D-pad | 16, 442, 132, 132 | `--btn-dark-lo` disc (circle, 132u). On it a cross of four 44 x 44u arms plus a 44u centre, `--btn-dark` with 3u `--btn-dark-hi` top edge. Each arm is a real `<button>` with an 8x8 pixel arrow. |
| A key | centre 292, 484; 52 x 52 | Octagon (`clip-path` with 12u corner cuts), `--btn-ab`, 6u `--btn-ab-lo` wall below, 3u `--btn-ab-hi` top edge. Letter `A` in `display-l` ink. Legend `STAMP` in `ui-s` below-right. |
| B key | centre 232, 524; 52 x 52 | Same as A. Legend `BACK`. |
| SELECT | centre 136, 600; 56 x 24 (hit 56 x 44) | `--btn-pill` rectangle with 4u stepped corners, 4u `--btn-pill-lo` wall. Legend `SELECT` above in `ui-s`, in `--shell-ink`. |
| START | centre 208, 600; 56 x 24 (hit 56 x 44) | Same. Legend `START`. |
| Speaker grille | 284, 576, 32, 32 | 5x5 grid of 4u square holes, 3u gaps. Hole = `--shell-edge`. A hole turns `--cursor` pink when its tile is stamped: a live mini-map. `aria-hidden`. |

### LCD internals (292 x 368u)
| Region | Height | Content |
|---|---|---|
| Header row | 22u | `--lcd-ink` bar. Board: five `display-s` letters B I N G O in `--lcd-paper`, each centred over its column. Other screens: screen title left, card code right, in `ui-s`. |
| Stage | 292u | The 5x5 grid, or the scorecard, menu, dialog. |
| Info bar | 54u | 2px `--lcd-ink` top border. See screen states. |

Scanline overlay: `repeating-linear-gradient(0deg, rgb(26 28 44 / 0.06) 0 1px, transparent 1px 3px)`. Nothing else textures the screen.

### Mobile page (below 1024px)
Single column, centred. Order: skip link; device (8px top margin); below it, in `--desk-ink`: a visually hidden `<h1>Bengaluru Bingo</h1>` (the sticker is decorative), a one-line `body` hint ("Tap a tile or use the buttons. START shows your score."), and the footer. The old header, season swatches, sticky bar and separate panels are gone: counter, tile detail, share and clear all live on the LCD.

### Desktop page (1024px and up)
Two columns, max width 1040px, 56px gap, vertically centred. Left: the device. Right (max 30rem), all on the desk:
1. Wordmark: `BENGALURU BINGO` in `display-xl` `--desk-ink` with a hard `4px 4px 0 var(--cursor)` text shadow, and `A GINHOUSE GAME BY GINCLAIR` in `ui-s` `--desk-dim`.
2. One `body` paragraph (the existing intro copy).
3. **Manual card**: a `panel` titled `CONTROLS` listing the keyboard map as a two-column table (key cap chips in Silkscreen on `--lcd-white` with 2px ink border, action in body).
4. **Save file readout**: `panel` with `17/25 STAMPED`, bingo line count, and the five category counts with glyphs. `aria-live="polite"`.
5. Footer line.

## 5. Screen states

State machine: `boot -> board <-> result -> share`, with overlays `pause`, `help`, `confirmClear`, `linkInfo`. Exactly one is active; inactive screens are unmounted or `inert`.

### Boot (1400ms, once per browser session, `sessionStorage bb:booted`)
1. 0ms: LCD is `--lcd-off`, LED off.
2. 150ms: LED turns on; LCD snaps to `--lcd-paper`.
3. 250 to 900ms: `GINHOUSE` types on, one letter per 80ms, in `display-l`, centred, with a blinking ink block cursor. Each letter plays a tick.
4. 900ms: `POCKET GH-25` appears below in `ui-s`; the food avatar's elephant head (16x16 crop) pops in above the wordmark; two-note chime.
5. 1400ms: wipe to board.
Any key, button or tap skips to the board at once. Reduced motion: no boot at all. `aria-hidden`; a live region says "Bengaluru Bingo ready" when the board appears.

### Board
- Grid: 5x5, tiles 56u, 2u gaps, 2u outer padding. Gaps and padding show `--lcd-mid`. Container `role="grid"`, label "Bingo card, 25 tiles"; tiles are `<button aria-pressed>` with the existing `name. blurb` label and a roving `tabindex` that follows the cursor.
- Tile (unstamped): `--lcd-paper`. Sprite 16x16 drawn at 2 device units per pixel (32u), centred, 6u from the top. Below it the short label (table in section 8) in `label`, ink, centred, 5u from the bottom. When the tile is 68px or larger (device 418px and up) draw the sprite at 3x (48px) with 4px top offset.
- Tile (hover, fine pointers only): `--lcd-white`. The info bar previews this tile without moving the cursor.
- Tile (stamped): fill `--lcd-stamped`, 2u inset ink border, and the 7x7 **stamp badge** (section 8) at 2x in the top-right corner, 2u in from the edges. Sprite and label stay visible. State is never colour-only: the badge and border carry it.
- Cursor: four L-shaped corner brackets around the cursor tile, each 10u long and 4u thick, outer half ink, inner half `--cursor`. They sit 1u outside the tile and blink between "tight" and "2u out" every 500ms. Starts on tile 13 (centre). The cursor is always visible on the board, including for touch users (it marks the last tile touched).
- Info bar: line 1, tile name in `body-strong` (left, truncates) and counter `17/25` in `display-s` (right) with one 8x8 star per completed line after it (cap 5, then `x12`). Line 2 to 3: category chip (8x8 glyph + category label in `label`, on the category colour, 2u ink border) followed by the blurb in `body-lcd`. The info bar is `aria-live="polite"` and always describes the cursor tile (or the hovered tile). Before the first input it shows: `D-PAD MOVE · A STAMP · START SCORE`.

### Result (scorecard)
Header row: `YOUR CARD` left, `NO.9Z3K7` right. Stage plus info area: the scorecard SVG (section 9) centred at 214 x 300u, on `--lcd-mid` with a hard `4u 4u 0 var(--lcd-ink)` shadow. Bottom 44u: two real buttons side by side, each half width, `ui-l`: `[A] SHARE` (primary, `--lcd-stamped`) and `[B] BOARD` (`--lcd-white`). A visually hidden paragraph repeats the score in words.

### Share menu
Header row: `SHARE`. A vertical list of six rows, each 44u tall, full LCD width, 2u `--lcd-mid` divider, 8x8 icon + `ui-l` text:
1. `SAVE IMAGE` 2. `WHATSAPP` 3. `POST ON X` 4. `COPY LINK` 5. `LINK CABLE` 6. `BACK TO BOARD`.
The selected row is inverted (`--lcd-ink` fill, `--lcd-paper` text) with a blinking `>` at the left. Rows are the real controls: `<button>`, the two `react-share` buttons, and a `<Link>`; pressing A calls `.click()` on the selected one. Under the list a 2-line status area (`role="status"`, `body-lcd`) carries the existing messages ("Link copied.", save errors with the fallback text).
- `LINK CABLE` with a friend's card waiting: goes to `/journey/[friend]/[mine]`; row reads `LINK CABLE: CLUB CARDS` and carries a pink dot.
- Without one: opens the `linkInfo` overlay, a dialog with the existing clubbing explanation in `body-lcd` and one button `COPY MY LINK`.
- `SAVE IMAGE` uses `html-to-image` on the inline scorecard with `pixelRatio = ceil(1000 / renderedWidth)` so the PNG is at least 1000px wide.

### Pause menu (SELECT)
Same list component, over a dimmed stage (stage gets a 50% ink checker dither, not opacity): `HOW TO PLAY`, `SOUND: ON` / `SOUND: OFF`, `CLEAR CARD` (row in `--lcd-dim` with `aria-disabled` when nothing is stamped), `RESUME`. `HOW TO PLAY` opens the `help` overlay: the controls table and two sentences of body copy, closed with A or B.

### Confirm clear
Centred dialog, 244 x 132u, `--lcd-white`, 4u ink border with 4u stepped corners, hard `4u 4u 0` ink shadow, `role="alertdialog"`. Title `LIFT ALL 17 STAMPS?` in `ui-l`. Two buttons 44u tall: `KEEP THEM` (focused by default, primary) and `YES, CLEAR`. Focus is trapped; B or Esc cancels.

### Bingo-line celebration (1200ms, does not block input)
Triggered when a stamp completes one or more new lines.
1. The five tiles of the line flash to `--lcd-ink` with inverted label, one after another, 60ms apart, twice.
2. The header row swaps B I N G O for a `--stamp` banner reading `BINGO!` in white `display-s`; it enters from the left in 4 steps of 73u and leaves after 900ms.
3. Twelve 4u confetti squares (`--cursor`, `--lcd-stamped`, `--cat-outdoors`, `--cat-hustle`) drop from the header to the info bar in 8 steps over 600ms.
4. LED blinks 3 times; five-note arpeggio; vibration pattern.
A polite live region announces "Bingo! Row 3 complete. 2 lines so far." A full card (25/25) runs the same sequence with the banner `NAMMA LEGEND!` and all 12 lines flashing in order.
Reduced motion: only the banner (no slide) and the announcement.

## 6. Controls map

| Input | Keyboard | Boot | Board | Result | Menus (share, pause) | Dialogs |
|---|---|---|---|---|---|---|
| D-pad | Arrow keys, W A S D | skip | Move cursor one tile; wraps at edges | none | Up/down move the selection, wraps | Left/right switch button |
| A | Z, Space | skip | Stamp or lift the cursor tile | Open share menu | Activate the selected row | Activate the focused button |
| B | X, Backspace, Esc | skip | Lift the stamp if the tile is stamped, else error blip | Back to board | Close the menu (share returns to result) | Cancel |
| START | Enter | skip | Go to result | Open share menu | Activate the selected row | Activate the focused button |
| SELECT | Shift (Tab stays native) | skip | Open pause menu | Open pause menu | Close the menu | Cancel |
| Sound toggle | M | (works) | Toggle sound and haptics | same | same | same |

Rules:
- Hardware keys are `<button>`s with `aria-label` ("D-pad up", "A: stamp", "B: back", "Start: show scorecard", "Select: menu") and `aria-keyshortcuts`.
- The global key handler ignores Space and Enter when focus is on a link or a button that is not a tile or a hardware key, so native activation still works. It ignores everything when a modifier (Ctrl, Alt, Meta) is held. Tab order: sound toggle, the LCD (grid is one tab stop; menus are a list), D-pad, B, A, SELECT, START, then page content.
- Holding a D-pad arm repeats after 300ms, every 120ms.
- **Touch**: tapping a tile moves the cursor there and toggles its stamp in one tap (same as today). Tapping a menu row selects and activates it. Tapping anywhere during boot skips it. The hardware keys respond on `pointerdown` (press visual and sound) and act on `click`.
- **Sound** (WebAudio, one shared `AudioContext` created on the first user gesture, square oscillators, gain 0.05, no files):

| Event | Notes |
|---|---|
| Cursor move | 660Hz, 30ms |
| Stamp | 523Hz then 784Hz, 50ms each |
| Lift | 392Hz then 262Hz, 50ms each |
| Error / edge | 110Hz, 80ms |
| Menu open / close | 440Hz then 660Hz / reversed, 40ms each |
| Screen change | 330, 494, 660Hz, 40ms each |
| Bingo | 523, 659, 784, 1047, 1319Hz, 70ms each |
| Boot chime | 784Hz then 1175Hz, 90ms each (only if audio is already unlocked) |

- **Haptics** (`navigator.vibrate`, feature-detected): key press 8ms; stamp 15ms; lift 8ms; bingo `[20, 40, 20, 40, 60]`.
- **Mute**: one switch for sound and haptics, stored in `localStorage` as `bb:sound` (`"on"` / `"off"`). Default on. Reachable from the bezel toggle, the pause menu and the M key; the toggle is a `<button aria-pressed>`.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no boot, no wipes (screens swap instantly), no cursor blink (brackets stay "tight"), no stamp scale, no confetti, no tile flashes, no LED blink. Button press depth, sound and haptics stay.

## 7. Motion

Everything moves in steps; there are no springs and no smooth eases. Framer Motion may stay for presence handling but every transition uses `steps()`.

| Name | Duration / easing | What |
|---|---|---|
| `key-press` | 60ms `steps(1)` down, 90ms `steps(2)` up | Key face moves down by its wall height (A/B 6u, START/SELECT 4u) and the wall collapses. D-pad: the pressed arm drops 3u and darkens to `--btn-dark-lo`. Applies on pointer, on click and when triggered from the keyboard. |
| `cursor-blink` | 1000ms loop `steps(2)` | Brackets alternate tight / 2u out. |
| `cursor-move` | 80ms `steps(2)` | Brackets jump half way, then land. |
| `stamp-land` | 150ms `steps(3)` | Badge scales 3x, 2x, 1x; tile flashes `--lcd-white` on the first frame, then settles on `--lcd-stamped`; tile nudges 2u down and back. |
| `stamp-lift` | 80ms `steps(2)` | Badge moves up 4u and disappears; fill returns to paper. |
| `screen-wipe` | 240ms `steps(8)` | Replaces the 3D flip. Eight horizontal blinds of the stage close to `--lcd-ink` (120ms), content swaps, they open (120ms). Used for board/result/share changes. |
| `menu-open` | 120ms `steps(4)` | Menu or dialog grows from the centre line of the stage (clip-path inset). Closing is instant. |
| `row-select` | none | Selection inversion is instant; only the `>` blinks, 600ms `steps(2)`. |
| `bingo` | 1200ms | See section 5. |
| `boot` | 1400ms | See section 5. |
| `led-pulse` | 2400ms `steps(2)` | LED alternates `--led-on` and 70% `--led-on` while idle. |
| `tiles-in` | 300ms total | On first board paint, tiles appear row by row, 60ms per row, no movement. |

The device itself never moves, tilts or floats.

## 8. Pixel art system

### Rendering
Sprites are text grids: an array of equal-length strings, one character per pixel. One shared function turns a grid into SVG: `<svg viewBox="0 0 W H" shape-rendering="crispEdges">` with one `<rect>` per horizontal run of same-colour pixels. The same function output is used in React and inside `scorecardSvg`. No `<image>`, no canvas, no CSS `image-rendering` tricks, no anti-aliasing.

### Grid sizes
| Asset | Grid | Shown at |
|---|---|---|
| Tile character | 16 x 16 | 32px (2x) or 48px (3x) on the board; 32px in journey lists; 64px in the desktop save-file panel if used |
| Stamp badge | 7 x 7 | 2x |
| Category glyph, UI icon, star | 8 x 8 | 1x to 3x, one colour (`currentColor`) |
| Avatar scene | 64 x 44 | 7px per pixel on the scorecard (448 x 308) |

### Sprite palette (single-character keys)
| Key | Hex | Name | Shadow key |
|---|---|---|---|
| `.` | transparent | | |
| `K` | `#1A1C2C` | Ink (outline, eyes) | |
| `W` | `#FFFFFF` | White (highlight) | `S` |
| `C` | `#FFE9C4` | Cream (idli, paper, skin of buildings) | `N` |
| `Y` | `#FFD23F` | Yellow | `O` |
| `O` | `#FF8A3D` | Orange | `R` |
| `R` | `#E5383B` | Red | `M` |
| `P` | `#FF6FB5` | Pink | `M` |
| `M` | `#C2185B` | Magenta (stamp) | `K` |
| `V` | `#8E5BD9` | Violet | `K` |
| `B` | `#3D8BFD` | Blue | `V` |
| `T` | `#23C4C4` | Teal | `D` |
| `G` | `#3CC47C` | Green | `D` |
| `D` | `#1E7A4C` | Dark green | `K` |
| `N` | `#A0623A` | Brown | `K` |
| `S` | `#B8C4CC` | Steel | `H` |
| `H` | `#6B7A86` | Dark steel | `K` |

Avatar scenes may add three backdrop-only keys: `L` `#A8E4FF` (day sky), `U` `#2D2A6E` (night sky), `E` `#E8C27A` (ground/sand). No other colours, anywhere.

### Rules
- **Outline**: every sprite has a closed 1px `K` outline. No coloured outlines, no missing corners (diagonals step 1 by 1). Steam, rays, rain and sparkles are the only unoutlined pixels.
- **Shading**: per colour area, at most one highlight (`W`, 1 to 3 pixels, top-left) and one shadow (the shadow key from the table, on the right or bottom edge, 1px wide). No dithering in tile sprites. Avatars may dither only in the sky.
- **Face**: the main object is a character. Eyes are two single `K` pixels on the same row, 2 pixels apart; the mouth is a 2px `K` line one or two rows below. No noses, no eyebrows. Vehicles may use windows as eyes.
- **Footprint**: stay inside columns 1 to 14 and rows 0 to 14; row 15 is empty so labels have air. Fill at least 10 of 16 columns.
- **Light source**: top-left, always.
- **No text** inside sprites except single symbols (`X`, `?`, `!`, the rupee is drawn as a `Y` coin with a `K` bar).

### Example sprites (the quality bar)

`kaapi` (steel tumbler in its davara, steam, face on the tumbler):
```
......W..W......
.....W..W.......
......W..W......
...KKKKKKKKKK...
...KNNNNNNNNK...
...KKKKKKKKKK...
....KWSSSSHK....
....KWKSSKHK....
....KWSSSSHK....
....KWSKKSHK....
.KKKKWSSSSHKKKK.
.KSSSSSSSSSSSSK.
..KSSSSSSSSSHK..
...KSSSSSSSHK...
....KKKKKKKK....
................
```

`dosa` (cone dosa with a face, on a steel plate with a dab of chutney):
```
.......KK.......
......KYYK......
......KYYK......
.....KYYYYK.....
.....KYWYYK.....
....KYYYYYOK....
....KYKYYKOK....
...KYYYYYYYOK...
...KYYYKKYYOK...
..KYYYYYYYYYOK..
..KOOOOOOOOOOK..
.KKKKKKKKKKKKKK.
.KWWWWWWWWWGGSK.
..KSSSSSSSSSSK..
...KKKKKKKKKK...
................
```

Stamp badge (7 x 7):
```
.MMMMM.
MMMMMWM
MMMMWWM
MWMWWMM
MWWWMMM
MMWMMMM
.MMMMM.
```

### Tile sprite briefs
`Label` is the on-tile text (add a `short` field to `tiles.json`; all are 7 characters or fewer).

| id | Label | Subject and silhouette | Key colours | Reads at 16px because | Bengaluru detail |
|---|---|---|---|---|---|
| `dosa` | DOSA | Tall cone dosa on a plate, face on the cone | Y, O, S, G | Triangle on a flat base | Green chutney dab |
| `signal` | JAM | Traffic light pole, three lamps, face on the housing | K housing, R lit, Y and G dim (use O, D) | Tall 6px-wide box with three stacked dots | Red is the lit one, always |
| `tree` | CUBBON | Round canopy tree, face in the canopy, short trunk | G, D, N | Big circle on a stick | Two `P` blossom pixels (tabebuia) |
| `rocket` | PITCH | Upright rocket with a round window; face sits below the window | W body, R nose and fins, B window, O flame | Pointed top, two fins, flame | Flame is 2px, it is only a pitch |
| `beer` | BREW | Mug with handle on the right, foam cap, face on the glass | Y beer, W foam, S handle | Square with a bump on the right and a cloud on top | Foam spills one pixel over the rim |
| `sunrise` | NANDI | Half sun with face rising behind a rounded hill, 3 ray pixels | O sun, Y rays, G and D hill | Semi-circle over a wide mound | Hill has a tiny `S` temple block on top |
| `bean` | CAFE | Coffee bean character sitting behind an open laptop | N bean, S laptop, W screen glow | Oval above a wide rectangle | One bean, one laptop, all day |
| `quiz` | QUIZ | Dome buzzer on a base with a face, 3 flash pixels above | R dome, Y base, W flash | Half circle on a slab | No question mark; the flash pixels carry it |
| `kaapi` | KAAPI | Tumbler in davara (drawn above) | S, H, N | Cup inside a wider bowl plus steam | Steel, not ceramic |
| `metro` | METRO | Train front view, two window eyes, two wheel pixels, track line | V body, W windows, Y headlamp | Rounded square with two big eyes | Violet for the Purple Line |
| `book` | BOOKS | Fat closed book standing up, bookmark ribbon, face on cover | R cover, C pages, Y ribbon | Rectangle with a striped right edge | Pages edge slightly uneven: second-hand |
| `chaat` | CHAAT | Bowl with a heap of puffed rice and three toppings, face on bowl | G bowl, Y heap, R and W toppings | Half circle bowl with a bumpy top | Leaf-green bowl (donne) |
| `auto` | AUTO | Auto-rickshaw side view, one wheel visible front and back, face on the windscreen side | Y top, G body, K wheels, W window | Hump roof and three-wheel stance | Green-yellow Bengaluru auto livery |
| `flower` | LALBAGH | Five-petal flower with face in the centre, stem, one leaf | P petals, Y centre, G stem | Radial symmetry | Petals alternate P and R like show bedding |
| `neon` | MEETUP | Small CRT monitor robot with antenna, face on screen, pizza-slice pixel beside it | K screen, T face pixels, V body, Y pizza | Square with antenna | T face on a dark screen: terminal vibes |
| `bus` | VAJRA | Bus side view, three windows, two wheels, face on the front panel | R body, W windows, K wheels, S bumper | Long box, clearly longer than the auto | Red Volvo livery |
| `cloud` | SWEATER | Cloud with face wearing a scarf, three rain pixels below | W cloud, S shadow, R scarf, B rain | Bumpy top, flat bottom | The scarf: jacket weather in May |
| `key` | PG LIFE | Old key held horizontally, round bow with face, two teeth, a tag | Y key, O shadow, R tag | Circle plus a long bar | Tag carries a room-number dot |
| `bubble` | ADJUST | Speech bubble with tail bottom-left, three dots inside as eyes-and-mouth row | B bubble, W dots | Rounded box with a tail | Dots sit slightly squeezed to the left: adjusting |
| `idli` | IDLI | Two stacked idlis and a vada (ring with hole) on a plate, face on the top idli | C idli, N vada, S plate, O sambar dab | Two white domes and a ring | Vada has its hole |
| `house` | DEPOSIT | Small house with pitched roof, door, face on the wall, coin above the roof | P wall, R roof, Y coin with K bar | Triangle on a square | The coin floats away from the house |
| `cricket` | STADIUM | Bat leaning diagonally with a red ball, face on the bat blade | C bat, N handle, R ball | Long diagonal plus a dot | Two `Y` noise pixels: the roar |
| `biryani` | BIRYANI | Handi pot with lid and knob, steam, face on the pot | O pot, R band, S lid, W steam | Wide round pot with a lid line | A dawn sun pixel pair (Y) at top-right |
| `phone` | CAB | Phone upright, screen with a big X, face under the X | C body, P screen, R cross | Tall rounded rectangle with X | The X is 5x5: cancelled |
| `elephant` | SAFARI | Elephant head front view, big ears, trunk down the centre, three rain pixels | V head, P ears, B rain | Wide ears plus trunk | Rain: Bannerghatta in the monsoon |

### Avatar scene briefs (64 x 44)
Composition rule: character head and shoulders, centred slightly left (the score plaque covers the bottom-right 26 x 10 pixels); horizon at row 32; one prop; one sky object. Head is at least 24px wide with 2x2 `K` eyes. Outline is 1px `K`; the character may use a 2px outline on its outer silhouette only.

| id | Badge | Scene |
|---|---|---|
| `food` | Foodie | Pink elephant (`P` head, `M` shadow, big ears) in a red shirt holding up a cone dosa (`Y`/`O`) on the left. Day sky `L`, red sun top-left, green ground `G`. |
| `commute` | Jam Survivor | Grey wolf (`S`/`H`) in an orange riding helmet with a visor. Night sky `U` with 5 white star pixels, a `Y` moon, a row of red tail-light pixels along the horizon, a traffic light post at the left edge. |
| `outdoors` | Park Walker | Green parakeet (`G` body, `D` wing, `R` beak, `Y` collar) on a brown branch that crosses the frame. Day sky `L`, pink tabebuia blossom clusters (`P`) top corners, one falling petal. |
| `hustle` | Tech Guru | Orange cat (`O`, `C` muzzle) behind an open steel laptop with a `T` glow on its face, coffee cup on the left. Dusk sky: `V` dithered into `P`, `Y` sun, two office-tower silhouettes in `U` with lit `Y` windows. |
| `scene` | Quiz Captain | Brown owl (`N`, `C` face disc, large `Y` eyes with `K` pupils) holding a pint (`Y`, `W` foam) on the left. Indoor wall `U` with a string of `Y`/`P`/`T` fairy-light pixels and a small `?` sign. |
| `none` | New Arrival | Orange fox (`O`, `W` cheeks) with a red suitcase (`R`, `Y` tag) on the left. Day sky `L`, one cloud, a small aeroplane silhouette top-right, sandy ground `E`. |

### Category glyphs (8 x 8, one colour)
| id | Glyph |
|---|---|
| `food` | Bowl (half circle, flat rim) with two steam pixels |
| `commute` | Wheel: 6px ring with a 2px hub |
| `outdoors` | Leaf: pointed oval with a diagonal vein gap |
| `hustle` | Lightning bolt, 3px wide, two steps |
| `scene` | Cocktail glass: inverted triangle, stem, base |

### UI icons (8 x 8, one colour), replacing `icons.tsx`
`flip` (two opposing arrows), `save` (down arrow into a tray), `chat` (speech bubble), `post` (X made of two diagonals), `link` (two interlocked chain squares), `club` (two cards overlapping with a plug between; also used for LINK CABLE), `sound-on` (speaker plus two wave pixels), `sound-off` (speaker plus x), `star` (5-point pixel star), `arrow` (D-pad triangle, rotated by transform in 90deg steps only).

## 9. Scorecard image (500 x 700 SVG)

A pixel trading card. One generator, `scorecardSvg(score, fonts, options)`, used inline and by `/api/scorecard/[code]`. Root has `shape-rendering="crispEdges"`. All rectangles land on a 4px grid. No season argument.

| Region | Geometry (px) | Content |
|---|---|---|
| Card body | 0, 0, 500, 700 | Fill = category colour of `score.top` (`--cat-none` if null). 8px ink border. Corners are stepped, not rounded: cut 8px then 4px (two steps). |
| Inner line | inset 16 | 4px `#FFFFFF` at 60% opacity, a holo-sticker edge. |
| Badge name | x 28, baseline 62 | Press Start 2P, 22px, ink, uppercase. Set `textLength` to `min(natural, 300)`. |
| Stars | right edge 472, y 34 to 62 | 1 to 4 `star` icons at 28px, 4px apart, ink, right-aligned. |
| Scene | 26, 84, 448, 308 | The avatar grid at 7px per pixel, 4px ink border outside it (22, 80, 456, 316). |
| Score plaque | 292, 356, 184, 72 | Ink rectangle, stepped corners, overlapping the scene's bottom-right. 4px `--lcd-stamped` inner line. `68%` in Press Start 2P 36px (30px for `100%`), `--lcd-paper`, centred, baseline 406. |
| Title | x 28, baseline 432 | `BENGALURU NATIVE`, Silkscreen 700, 18px. |
| Tier line | x 28, baseline 462 | `Pakka local, 1 bingo line` in Pixelify Sans 600, 17px. |
| Stats | y 484 to 580 | Five cells, 84px wide, at x = 28 + i * 92. In each: glyph at 24px (3x) at (0, 0); white count box 44 x 44 at (36, -6) with 4px ink border; count in Press Start 2P 18px centred; label below at baseline +68 in Silkscreen 400, 12px. |
| Divider | y 598, x 28 to 472 | 4px ink dashes, 8 on, 4 off. |
| Footer left | baselines 630, 652, 678 | `BENGALURU BINGO` Silkscreen 700 14px; `A GINHOUSE GAME BY GINCLAIR` Silkscreen 400 11px; `NO.9Z3K7` Press Start 2P 14px. |
| Stamp map | 424, 616, 48, 48 | 5 x 5 cells of 8px with 2px gaps. Stamped cell = ink, unstamped = white at 60%. The card's fingerprint. |

Fonts in the standalone file:
`<style>@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;family=Silkscreen:wght@400;700&amp;family=Pixelify+Sans:wght@400;600&amp;display=swap');</style>`
with stacks `'Press Start 2P', 'Courier New', monospace`, `'Silkscreen', 'Courier New', monospace`, `'Pixelify Sans', 'Trebuchet MS', sans-serif`. Remote fonts do not load when the SVG is used as an `<img>` or link preview, so every Press Start 2P text also carries `textLength` and `lengthAdjust="spacingAndGlyphs"` to hold the layout on the fallback. `<title>` and `aria-label` keep the existing sentence.

## 10. Other pages

Shared chrome for all three: `--desk` background with the checker, a compact header (8x8 pixel elephant + `BENGALURU BINGO` in `ui-l` `--desk-ink`, linking home; no season switch), the footer line in `body` `--desk-dim`. Content sits in **panels** and **page buttons**:

- **Panel**: `--lcd-paper` fill, ink text, 4px ink border, stepped corners (4px cut via `clip-path` or four corner pixels), hard shadow `4px 4px 0 var(--desk-shadow)`, 16px padding. Optional header strip: 28px tall, category or accent fill, title in `ui-l` ink.
- **Page button** (`.btn`): 48px tall, `ui-l`, ink text, 4px ink border, stepped corners, fill `--lcd-paper` (default) or `--btn-pill` (primary, one per view), wall `0 4px 0 var(--lcd-ink)`. Hover: fill `--lcd-white` / `--btn-pill-hi`. Active: `translateY(4px)` and the wall disappears. Disabled: `--lcd-mid` fill, `--lcd-dim` text, no wall. 8x8 icon at 2x on the left.
- **Screen frame**: the device's bezel on its own (`--bezel`, radius 14px, top strip with LED and `GINHOUSE POCKET`), used to present a scorecard outside the device.

### `/card/[code]` (a friend's card)
Mobile: one column. Desktop: 380px left column and text right, 56px gap. Left: the scorecard inside a screen frame (16px bezel padding). Right: `display-xl` heading `A FRIEND IS 68% BENGALURU NATIVE` (wraps; 20px on mobile), the existing paragraph in `body`, then `ClubActions` as page buttons: primary `LINK CABLE: CLUB WITH MY CARD` with the `club` icon and `BACK TO MY BOARD`, or the single primary `STAMP MY OWN CARD`.

### `/journey/[a]/[b]` (link cable)
1. Heading `BINGO JOURNEY` in `display-xl`, then the match sentence in `body`.
2. **Link-cable hero**: the two scorecards side by side (each in a screen frame, 2 columns on mobile, max 240px each on desktop), joined by a pixel cable: an 8px ink line with a `--cursor` core from the bottom-centre of each frame down 16px and across, meeting at a plug badge in the middle that shows the match as `56%` in `display-l` on `--lcd-stamped` with ink border. Cable is `aria-hidden`; the percentage is repeated in the sentence above.
3. Four panels in a grid (1 column mobile, 2 columns desktop), each with a header strip and a tile list. List rows: 32px tile sprite on a `--lcd-white` 40px square with 2px ink border, then the tile name in `body`.
   - `TRY THESE TOGETHER` (strip `--lcd-stamped`), with the count sentence.
   - `YOU'VE BOTH DONE 9` (panel inverted: `--lcd-ink` fill, `--lcd-paper` text, strip `--cat-scene`). Sprite squares stay `--lcd-white`.
   - `ONLY CARD 9Z3K7` (strip `--shell`).
   - `ONLY CARD 3K2A1` (strip `--cat-hustle`).
   Existing empty-state sentences stay.
4. Primary page button `BACK TO MY BOARD`.

### 404
A screen frame (max 360px) showing an LCD in `--lcd-paper`: the `none` fox head (16 x 16 crop at 4x) with `X` eyes, `NO CARD FOUND` in `display-l`, and a blinking block cursor. Below the frame: the existing explanation in `body` `--desk-ink` and the primary button `STAMP MY OWN CARD`. Heading for assistive tech stays "That card isn't on the board".

## 11. Do not

- **No console trademarks.** No Nintendo or Game Boy names, logos, wordmarks, boot animation, jingle, grey-brick proportions, purple-and-magenta "atomic" look, or slanted START/SELECT. The device is the Ginhouse Pocket GH-25.
- **No seasonal colours.** No season switch, no month logic, no `season` in props, storage or API payloads.
- **No anti-aliased art.** No stroked paths, circles, gradients or bitmaps in illustrations. Rects on the grid, `crispEdges`, palette keys only.
- **No soft shadows or blur.** Every `box-shadow` and `text-shadow` has zero blur. No `backdrop-filter`, no glow. The only alpha is the shell tint, the gloss stripe, the circuit pattern and the scanlines.
- **No rotation** of anything, including stamps and stickers. Arrows rotate in 90deg steps only.
- **No smooth easing.** `steps()` only. No springs, no 3D flip, no parallax, no idle device wobble.
- **No sentences in Press Start 2P or Silkscreen.** Sentences are Pixelify Sans.
- **No white text on pink**, no `--lcd-dim` text under 12px, no text on the gloss stripe.
- **No button-only actions.** Everything the hardware keys do is also reachable by tapping the LCD or a real link/button, and by keyboard.
- **No audio files, image files or icon fonts.** Sound is oscillators; art is inline SVG rects.
- **No emoji** as icons.
- **No autoplaying sound before a user gesture**, and nothing that plays when muted.
