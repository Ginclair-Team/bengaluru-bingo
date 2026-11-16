---
name: Bengaluru Bingo
description: A stamped bingo board on the front, a trading card on the back. A Ginhouse game.
colors:
  outline: "#000000"
  white: "#FFFFFF"
  monsoon-ground: "#B7C7D0"
  monsoon-board: "#086F8A"
  monsoon-board-ink: "#E9FBFF"
  monsoon-paper: "#D5F1F7"
  monsoon-ink: "#064B5E"
  monsoon-stamp: "#E8344A"
  monsoon-accent: "#00B4D8"
  summer-ground: "#F3F0E6"
  summer-board: "#D4253A"
  summer-board-ink: "#FFF9C9"
  summer-paper: "#FBD9CF"
  summer-ink: "#9E0F22"
  summer-stamp: "#2B3FD6"
  summer-accent: "#FF4757"
  winter-ground: "#DDD3F0"
  winter-board: "#5B3FA8"
  winter-board-ink: "#FFF4DC"
  winter-paper: "#EFE6FF"
  winter-ink: "#3A2478"
  winter-stamp: "#E8344A"
  winter-accent: "#A56EDB"
  spring-ground: "#F1E4CF"
  spring-board: "#FF9F43"
  spring-board-ink: "#2A1245"
  spring-paper: "#FFF3DC"
  spring-ink: "#7A3E00"
  spring-stamp: "#6A3FD0"
  spring-accent: "#E0A100"
  art-yellow: "#FFC93C"
  art-orange: "#FF8A3D"
  art-red: "#FF4757"
  art-pink: "#FF8FB8"
  art-green: "#3CC47C"
  art-blue: "#4DA8F7"
  art-purple: "#A56EDB"
  art-cream: "#FFF4DC"
typography:
  display:
    fontFamily: "Dela Gothic One, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.05
  board-letters:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "15cqw"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 75"
  body:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    fontVariation: "'wdth' 87.5"
  label:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "max(8px, 2.5cqw)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.03em"
    fontVariation: "'wdth' 75"
rounded:
  control: "12px"
  panel: "16px"
  board: "5cqw"
spacing:
  gutter: "12px"
  panel: "16px"
  column-gap: "56px"
components:
  button:
    backgroundColor: "{colors.monsoon-paper}"
    textColor: "{colors.outline}"
    rounded: "{rounded.control}"
    padding: "0 0.8rem"
    height: "48px"
  button-primary:
    backgroundColor: "{colors.outline}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 0.8rem"
    height: "48px"
  panel:
    backgroundColor: "{colors.monsoon-paper}"
    textColor: "{colors.outline}"
    rounded: "{rounded.panel}"
    padding: "16px"
  tile:
    backgroundColor: "{colors.monsoon-paper}"
    textColor: "{colors.monsoon-ink}"
    rounded: "0px"
---

# Design System: Bengaluru Bingo

## Overview

**Creative North Star: "One card, two faces"**

The whole product is a single physical card. The front is a printed bingo board in the season's colour that you mark with a rubber stamp. The back is your trading card: a character, a badge, stars, stat boxes and a card number. Everything else on screen is a quiet label next to that object.

Two references from the owner set the grammar. The board follows a one-colour riso print: a saturated field, pale paper tiles, grid lines made by the field showing through a 2px gap, two-word labels in condensed mono capitals, and smiley stamps in a clashing ink at careless angles. Characters and the scorecard follow the trading-card set: a uniform thick black outline, flat fills, a two-stop pastel sky, a coloured frame.

The palette is seasonal. The same seven roles (ground, board, board ink, paper, ink, stamp, accent) are re-inked four times a year, and the visitor can pin any season.

**Key Characteristics:**
- Flat colour and black outline carry everything. There are no shadows and no blur.
- The board and the scorecard share one 5:7 footprint and flip into each other.
- Illustration is geometric: circles, rounded rectangles, dot eyes.
- Stamps are the only thing allowed to sit crooked.

## Colors

Seven roles per season, plus a fixed illustration palette that never changes with the calendar.

### Primary
- **Board** (per season: monsoon teal, summer red, winter violet, spring orange): the bingo board field, the one large saturated area on screen. Also the fill of the "both done" panel on the journey page.
- **Stamp ink** (per season): marked tiles only. It always clashes with the board on purpose.

### Secondary
- **Illustration palette** (art-yellow, art-orange, art-red, art-pink, art-green, art-blue, art-purple, art-cream): fills for tile characters, avatars and scorecard frames. The scorecard frame takes the colour of the player's top category.

### Neutral
- **Ground** (per season): the page.
- **Paper** (per season): tiles, panels and default buttons.
- **Ink** (per season): labels printed on paper.
- **Board ink** (per season): lettering printed on the board.
- **Outline** (#000000): every border, every illustration stroke, primary buttons and body text. Pure black, as in the trading-card reference.

### Named Rules
**The Re-ink Rule.** A component never names a season's hex. It uses the role (`board`, `paper`, `ink`, `stamp`) and the calendar does the rest.
**The AA Rule.** Board ink on board and ink on paper hold at least 4.5:1 in every season. The spec's named dominants (#FF4757, #00B4D8) are too light for that, so they are deepened on the board and kept as the small accent.

## Typography

**Display Font:** Dela Gothic One (with sans-serif)
**Body and Label Font:** Martian Mono, variable width (with ui-monospace)

**Character:** A heavy, wide display face for names and numbers, as on the trading cards, against a condensed mono that reads as printed card stock.

### Hierarchy
- **Display** (400, 1.25rem to 3rem, 1.05): page title, panel headings, badge name, percentage and card number.
- **Board letters** (800, 15cqw, width 75): B I N G O, one letter per grid column.
- **Body** (400 to 700, 0.875rem, 1.55, width 87.5): instructions and descriptions.
- **Label** (600, max(8px, 2.5cqw), 0.03em, width 75, uppercase): tile labels and board footer.

### Named Rules
**The Card Scale Rule.** Type printed on the card is sized in container units against the card face, so the card scales as one object from a phone to a desktop.

## Layout

One column up to 472px on phones: header, card, a one-tile detail strip, and a sticky bar holding the count and the flip button. From 1024px the card sits in a fixed 440px left column and the detail, count and actions move to a right column with a 56px gap. The journey page is a bento grid, two columns on phones and four on desktop, with the two scorecards first.

## Elevation & Depth

Flat. No box shadows, no blur, no glass. Depth comes from the black outline, from one surface overlapping another (the score badge over the scene), and from the 3D flip between the card's two faces. The board carries a faint multiply-blended paper grain so its colour reads as print.

### Named Rules
**The No Shadow Rule.** If something needs to stand out, give it an outline or a fill, never a shadow.

## Shapes

Every contained surface has a 3px black border. Buttons round at 12px, panels at 16px, the board at 5cqw. Tiles are square with no radius: the grid is rigid. Illustration strokes are a uniform weight with round joins and caps. Circles recur as a motif: season swatches, the stamp ring, the score badge, the accent dot.

## Components

### Buttons
- **Shape:** 12px radius, 3px black border, 48px tall, bold mono label, optional 20px line icon on the left.
- **Default:** paper fill, black text. Hover turns the fill white.
- **Primary:** black fill, white text. Hover takes the season's ink. One per view.
- **Pressed / Focus / Disabled:** moves down 2px when pressed; focus is a 3px black outline offset 3px; disabled is a dashed border with no fill.

### Panels
- **Corner Style:** 16px.
- **Background:** paper, or board with board ink for emphasis.
- **Border:** 3px black. No shadow.
- **Internal Padding:** 12px to 16px.

### Tile
Square paper cell: label, character, label. Scales up 5% on hover and down 5% on press. The tile last touched carries a 2px inset ink ring. A marked tile gets a stamp.

### Stamp (signature)
A broken-ring smiley in stamp ink, multiply-blended over the tile, rotated between -18 and +18 degrees by tile position. It lands on a stiff spring from 1.9x scale: a thud, not a fade.

### Card flip (signature)
Board and scorecard are the two faces of one 5:7 object, rotating on the vertical axis with a slow, heavy spring. Tiles settle into the board once on load, staggered. With reduced motion, both changes are instant.

### Season switch
Four outlined swatches in each season's board colour; the active one is larger. Choosing the calendar's own season removes the pin.

### Scorecard
One SVG, 500x700: coloured frame, badge name and one to four stars, outlined scene with the avatar, black score badge overlapping the scene's lower right, five stat boxes, footer with the Ginhouse line and card number. The same generator serves the page and `/api/scorecard/[code]`.

## Do's and Don'ts

### Do:
- **Do** use season roles (`bg-board`, `text-ink`, `bg-paper`) instead of fixed hex values.
- **Do** outline every surface in 3px black and every illustration in one stroke weight.
- **Do** draw new characters from circles and rounded rectangles with dot eyes, on a 48x48 grid.
- **Do** size anything printed on the card in `cqw`.
- **Do** check both lettering pairs for 4.5:1 when adding a season.

### Don't:
- **Don't** add shadows, blur or gradients to interface surfaces. Gradients belong only to the sky behind an avatar.
- **Don't** round the tiles or loosen the 2px grid.
- **Don't** rotate anything except stamps.
- **Don't** use emoji or an icon font; icons are drawn in the same round stroke.
- **Don't** put a second primary button in one view.
