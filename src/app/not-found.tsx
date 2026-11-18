import Link from "next/link";
import type { CSSProperties } from "react";
import { BingoCardIllustrator } from "@/games/bingo/illustrator";
import { ScreenFrame } from "@/console/device/ScreenFrame";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[472px] px-4 pb-10">
      <SiteHeader />
      <main className="py-6">
        <div className="mx-auto max-w-[360px]">
          <ScreenFrame className="screen-frame--on-desk">
            <div className="flex flex-col items-center gap-4 px-4 py-8" aria-hidden="true">
              <div style={{ "--s": "64px" } as CSSProperties}>
                <BingoCardIllustrator id="elephant" className="spr" />
              </div>
              <p className="t-display-l m-0 text-center">No card found</p>
              <span className="block-cursor" />
            </div>
          </ScreenFrame>
        </div>
        <h1 className="sr-only">That card isn&apos;t on the board</h1>
        <p className="t-body mx-auto mt-6 max-w-[36rem] text-center">
          The link is incomplete or was mistyped. Ask your friend to send it again, or stamp a card
          of your own.
        </p>
        <div className="mt-4 flex justify-center">
          <Link href="/" className="btn btn--primary">
            Stamp my own card
          </Link>
        </div>
      </main>
      <SiteFooter className="text-center" />
    </div>
  );
}
