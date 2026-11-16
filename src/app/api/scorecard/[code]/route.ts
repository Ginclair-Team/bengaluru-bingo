import { STANDALONE_FONTS, scorecardSvg } from "@/components/Cards/scorecardSvg";
import { decodeMarks, scoreFor } from "@/lib/game";
import { isSeasonId, seasonForDate } from "@/theme/seasons";

// GET /api/scorecard/:code?season=monsoon
// The scorecard as a server-rendered SVG image, built by the same generator
// the page uses.
export function GET(request: Request, { params }: { params: { code: string } }) {
  const marks = decodeMarks(params.code);
  if (marks === null) {
    return new Response("Unknown card code.", { status: 404 });
  }
  const requested = new URL(request.url).searchParams.get("season");
  const season = isSeasonId(requested) ? requested : seasonForDate(new Date());
  const svg = scorecardSvg(scoreFor(marks), season, STANDALONE_FONTS, { standalone: true });

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
