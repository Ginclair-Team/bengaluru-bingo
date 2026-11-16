"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowIcon, ClubIcon } from "@/components/icons";
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
    <div className="flex flex-col items-stretch sm:flex-row sm:flex-wrap sm:items-start">
      {mine && mine !== friendCode ? (
        <>
          <Link href={`/journey/${friendCode}/${mine}`} className="btn btn--primary">
            <ClubIcon className="ico" />
            Link cable: club with my card
          </Link>
          <Link href="/" className="btn">
            <ArrowIcon dir="left" className="ico" />
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
