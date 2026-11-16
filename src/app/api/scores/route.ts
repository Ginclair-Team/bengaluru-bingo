import { NextResponse } from "next/server";
import { decodeMarks, scoreFor } from "@/lib/game";

// POST /api/scores
// Body: { anonymous_id: uuid, card_code: string }
//
// Any legacy `season` field in the body is ignored: there are no seasons.
//
// Records a finished round. Stores an anonymous id and the card, never a
// name or phone number. Writes to Supabase when SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are set (see db/schema.sql); until then it
// validates the round and answers stored: false.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const { anonymous_id, card_code } = (body ?? {}) as Record<string, unknown>;
  if (typeof anonymous_id !== "string" || !UUID.test(anonymous_id)) {
    return NextResponse.json({ error: "anonymous_id must be a UUID." }, { status: 400 });
  }
  const marks = typeof card_code === "string" ? decodeMarks(card_code) : null;
  if (marks === null) {
    return NextResponse.json({ error: "card_code is not a valid card." }, { status: 400 });
  }

  const score = scoreFor(marks);
  const row = {
    anonymous_id,
    card_code: score.code,
    percent: score.percent,
    bingo_lines: score.lines,
    badge: score.badge,
  };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ stored: false, reason: "No database connected.", score: row }, { status: 202 });
  }

  const response = await fetch(`${url}/rest/v1/scores?on_conflict=anonymous_id`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    return NextResponse.json({ stored: false, reason: "The database rejected the score." }, { status: 502 });
  }
  return NextResponse.json({ stored: true, score: row }, { status: 201 });
}
