import { STANDALONE_FONTS, scorecardSvg } from "@/games/bingo/cards/scorecardSvg";
import { decodeMarks, scoreFor } from "@/games/bingo/rules";

// GET /api/scorecard/:code
// The scorecard as a server-rendered SVG image, built by the same generator
// the page uses.
export function GET(_request: Request, { params }: { params: { code: string } }) {
  const marks = decodeMarks(params.code);
  if (marks === null) {
    return new Response("Unknown card code.", { status: 404 });
  }
  const svg = scorecardSvg(scoreFor(marks), STANDALONE_FONTS, { standalone: true });

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
