# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion, `react-share` for social sharing, custom SVG generators under `components/Cards`. Backend target is Supabase/PostgreSQL behind Next.js API routes. First build is local-first: progress lives in the browser under an `anonymous_id`, cards link through share links, and the SQL schema and API routes are written but not connected to a live database (confirmed by the owner, 2026-11-16).

## Users

Anyone with a relationship to Bengaluru, long-time locals and newcomers alike, on a phone. They play a quick score-and-share round of about two minutes: tick what they have done, get a score, post it to Instagram Stories or WhatsApp status. Tiles left unticked double as a list of things to try next.

## Product Purpose

Bengaluru Bingo turns knowledge of the city's subcultures (spots, trends, habits) into a social bingo game. A finished round produces a shareable scorecard: "I am X% Bengaluru Native" with a ranking badge. Success is a scorecard people actually post, and friends who open the link and play their own card.

## Positioning

A "City-Bio" engine: the score describes the player's own relationship with one specific city, built from tiles only someone who knows Bengaluru would recognise, and two players can club their cards into a shared "Bingo Journey".

## Operating Context

- Mobile-first, thumb-driven, played in short sessions.
- Results are shared as images or links to Instagram Stories, WhatsApp status and X.
- Must load within 3 seconds on a typical Indian 4G/3G connection.

## Capabilities and Constraints

- Bingo card: a strict 5x5 grid (7x7 is a possible later size). Each tile has a name, a category (for example Tech Hubs, Street Food, Nightlife) and an illustrated character.
- Tile content is static JSON. No real-time scraping of Reddit/X during play; a `scrapers` folder exists only as a seeding stub for later.
- Scorecard: an SVG infographic with the native percentage and a ranking badge (for example "The Tech Guru", "Foodie").
- Card clubbing: player A's card and player B's card link into one shared journey view.
- Presentation: the game runs inside a Y2K handheld console, the Bengaluru Pocket BP-01, with a pixel LCD and working D-pad, A, B, CONTINUE and MENU keys (also mapped to the keyboard). Tiles stay directly tappable. One fixed palette; the earlier seasonal theme engine is retired (owner's direction, 2026-11-16).
- Optional 8-bit sound and vibration, generated in the browser, with a persisted mute switch.
- No PII: no names or phone numbers stored, only `anonymous_id`.
- Tile characters are original pixel art (16x16 text grids rendered as SVG rects); `src/games/bingo/illustrator` holds them.

## Brand Commitments

- Owner: Ginclair. Brand: Ginhouse. System text and the scorecard carry Ginhouse branding.
- Binding visual direction from the owner (2026-11-16, supersedes the earlier trading-card and seasonal spec): a Y2K handheld-console interface with real buttons, pixel-art illustrations throughout, and no seasonal theme change. Details live in `DESIGN.md`.
- Still binding from the original spec: rigid 5x5 bingo grid; friendly characters with dot eyes; scorecard reads as a collectible card worth posting.
- The device is original Ginhouse hardware. No third-party console names, logos or look-alike branding.

## Evidence on Hand

- `projectprompt.txt`: the owner's master spec.
- Reference images: not yet in the project folder.
- No real user data, testimonials or usage numbers exist; none may be invented. Tile content is authored for the first build and needs the owner's review.

## Product Principles

1. Score first: a round finishes and produces something postable in about two minutes.
2. The share is the product: the scorecard has to look good enough to post unprompted.
3. Only-in-Bengaluru specificity: every tile should make a local nod and a newcomer curious.
4. Anonymous by default: nothing personal is ever needed to play or share.
5. Light on the network: it works on a mid-range phone on patchy 4G.

## Accessibility & Inclusion

WCAG AA colour contrast for every text pair in the fixed palette. Touch targets of at least 44px, including the console keys. Everything the console keys do is also reachable by tapping the screen and by keyboard. Visible focus states. Reduced-motion preference respected. Sound and vibration are optional and mutable.

## Platform (added 2026-11-18)

Bengaluru Pocket is a pocket console of small games about the city. Bingo, Which Side, Macha? and Gundu are the first three cartridges. Future cartridges share the console's hardware, pixel art, palette, sound and menu, and each brings its own rules and screens. See `DESIGN.md` section 12 for the contract.
