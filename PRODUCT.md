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
- Seasonal theme engine: the palette shifts with the date. Summer (May to August), Monsoon (September to November), Spring/Autumn; Winter is named in the spec but has no palette defined yet (open decision).
- No PII: no names or phone numbers stored, only `anonymous_id`.
- Tile characters are original SVG art for now; `components/BingoCardIllustrator` is the slot for AI-generated art later.

## Brand Commitments

- Owner: Ginclair. Brand: Ginhouse. System text and the scorecard carry Ginhouse branding.
- Binding visual constraints from the owner's spec: rigid retro bingo grid; "Tangz-style" character illustration with thick black outlines and flat vibrant pastel gradient grounds; chunky sans headers (Fredoka or Poppins named); monospace or technical sans for data labels; scorecard reads as a digital postcard; bento grouping on share cards.
- Seasonal dominants named in the spec: Summer #FF4757 with Sand #F3F0E6 and Cream #FFF9C9; Monsoon #00B4D8 with rainy grey and ocean blue; Spring/Autumn #FF9F43 with muted beige and gold.
- The spec cites three reference images (bingo board, postcard scorecard, Tangz illustration). The owner is supplying them; they are binding once present.

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

WCAG AA colour contrast in every seasonal theme, including white text on the red summer board. Touch targets sized for thumbs. Reduced-motion preference respected.
