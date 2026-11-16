"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClubIcon } from "@/components/icons";
import { encodeMarks } from "@/lib/game";
import { loadGame } from "@/lib/storage";

/** What a visitor can do with someone else's card. */
export function ClubActions({ friendCode }: { friendCode: string }) {
  const [mine, setMine] = useState<string | null>(null);

  useEffect(() => {
    const { marks } = loadGame();
    if (marks > 0) setMine(encodeMarks(marks));
  }, []);

  return (
    <div className="grid gap-2">
      {mine && mine !== friendCode ? (
        <>
          <Link href={`/journey/${friendCode}/${mine}`} className="btn btn--primary">
            <ClubIcon />
            Club with my card
          </Link>
          <Link href="/" className="btn">
            Back to my board
          </Link>
        </>
      ) : (
        <Link href={`/?club=${friendCode}`} className="btn btn--primary">
          Stamp my own card
        </Link>
      )}
    </div>
  );
}
