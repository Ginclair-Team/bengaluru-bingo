"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { TwitterShareButton, WhatsappShareButton } from "react-share";
import type { Score } from "@/lib/game";
import { ChatIcon, ClubIcon, LinkIcon, PostIcon, SaveIcon } from "./icons";

type Status = { kind: "idle" } | { kind: "ok" | "error"; message: string };

export function SharePanel({
  score,
  cardRef,
  friendCode,
}: {
  score: Score;
  /** The element to save as an image. */
  cardRef: React.RefObject<HTMLDivElement>;
  /** A friend's card this player arrived from, if any. */
  friendCode: string | null;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [saving, setSaving] = useState(false);

  const url =
    typeof window === "undefined" ? `/card/${score.code}` : `${window.location.origin}/card/${score.code}`;
  const text = `I am ${score.percent}% Bengaluru native (${score.badge}). Stamp your own card:`;

  const saveImage = useCallback(async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `bengaluru-bingo-${score.code}.png`;
      a.click();
      setStatus({ kind: "ok", message: "Image saved. It's ready for your story or status." });
    } catch {
      setStatus({ kind: "error", message: "The image couldn't be saved here. Take a screenshot of the card instead." });
    } finally {
      setSaving(false);
    }
  }, [cardRef, score.code]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus({ kind: "ok", message: "Link copied." });
    } catch {
      setStatus({ kind: "error", message: `Copying is blocked in this browser. Your link is ${url}` });
    }
  }, [url]);

  return (
    <section aria-labelledby="share-heading" className="panel p-4">
      <h2 id="share-heading" className="display text-lg">
        Post your card
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className="btn btn--primary" onClick={saveImage} disabled={saving}>
          <SaveIcon />
          {saving ? "Saving" : "Save image"}
        </button>
        <WhatsappShareButton url={url} title={text} separator=" " resetButtonStyle={false} className="btn">
          <ChatIcon />
          WhatsApp
        </WhatsappShareButton>
        <TwitterShareButton url={url} title={text} resetButtonStyle={false} className="btn">
          <PostIcon />
          Post on X
        </TwitterShareButton>
        <button type="button" className="btn" onClick={copyLink}>
          <LinkIcon />
          Copy link
        </button>
      </div>

      <p role="status" className="mt-2 min-h-[1.5em] break-words text-xs font-semibold">
        {status.kind !== "idle" ? status.message : ""}
      </p>

      <h3 className="display mt-3 text-base">Club cards</h3>
      {friendCode ? (
        <>
          <p className="mt-1 text-xs">Your friend's card is waiting. Put the two side by side.</p>
          <Link href={`/journey/${friendCode}/${score.code}`} className="btn mt-3 w-full">
            <ClubIcon />
            Club with my friend's card
          </Link>
        </>
      ) : (
        <p className="mt-1 text-xs">
          Send your link to a friend. When they stamp their own card, the two join into one Bingo
          Journey: what you've both done, and what to try together.
        </p>
      )}
    </section>
  );
}
