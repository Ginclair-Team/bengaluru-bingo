import { NextResponse } from "next/server";
import { decodeMarks, scoreFor } from "@/games/bingo/rules";

// GET /api/cards/:code
// A card's score, computed from the share code alone. No database needed:
// the code is the card.
export function GET(_request: Request, { params }: { params: { code: string } }) {
  const marks = decodeMarks(params.code);
  if (marks === null) {
    return NextResponse.json({ error: "Unknown card code." }, { status: 404 });
  }
  const score = scoreFor(marks);
  return NextResponse.json({
    code: score.code,
    marked: score.marked,
    percent: score.percent,
    bingo_lines: score.lines,
    tier: score.tier.label,
    stars: score.tier.stars,
    badge: score.badge,
    by_category: score.byCategory,
    image_url: `/api/scorecard/${score.code}`,
  });
}
