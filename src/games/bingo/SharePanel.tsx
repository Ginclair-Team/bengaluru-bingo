"use client";

import Link from "next/link";
import { useCallback, useState, type RefObject } from "react";
import { TwitterShareButton, WhatsappShareButton } from "react-share";
import { ArrowIcon, ChatIcon, ClubIcon, LinkIcon, PostIcon, SaveIcon } from "@/components/icons";
import type { Score } from "@/games/bingo/rules";

export type ShareStatus = { kind: "idle" } | { kind: "ok" | "error"; message: string };

export function cardUrl(code: string): string {
  return typeof window === "undefined" ? `/card/${code}` : `${window.location.origin}/card/${code}`;
}

/** Copy the card link. Resolves to the status line to show. */
export async function copyCardLink(code: string): Promise<ShareStatus> {
  const url = cardUrl(code);
  try {
    await navigator.clipboard.writeText(url);
    return { kind: "ok", message: "Link copied." };
  } catch {
    return { kind: "error", message: `Copying is blocked in this browser. Your link is ${url}` };
  }
}

/**
 * The share menu. Six rows, each a real control (button, react-share button
 * or link). The Game drives the selection from the D-pad and calls .click()
 * on the selected row when A or START is pressed.
 */
export function SharePanel({
  score,
  cardRef,
  friendCode,
  selected,
  onSelect,
  status,
  setStatus,
  onLinkInfo,
  onBack,
  listRef,
}: {
  score: Score;
  /** The element that contains the inline <Scorecard>, saved as an image. */
  cardRef: RefObject<HTMLDivElement>;
  /** A friend's card this player arrived from, if any. */
  friendCode: string | null;
  selected: number;
  onSelect: (index: number) => void;
  status: ShareStatus;
  setStatus: (status: ShareStatus) => void;
  onLinkInfo: () => void;
  onBack: () => void;
  listRef: RefObject<HTMLUListElement>;
}) {
  const [saving, setSaving] = useState(false);

  const url = cardUrl(score.code);
  const text = `I am ${score.percent}% Bengaluru native (${score.badge}). Stamp your own card:`;

  const saveImage = useCallback(async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const width = cardRef.current.getBoundingClientRect().width || 500;
      const pixelRatio = Math.max(1, Math.ceil(1000 / width));
      const dataUrl = await toPng(cardRef.current, { pixelRatio, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `bengaluru-bingo-${score.code}.png`;
      a.click();
      setStatus({ kind: "ok", message: "Image saved. It's ready for your story or status." });
    } catch {
      setStatus({
        kind: "error",
        message: "The image couldn't be saved here. Take a screenshot of the card instead.",
      });
    } finally {
      setSaving(false);
    }
  }, [cardRef, saving, score.code, setStatus]);

  const copyLink = useCallback(async () => {
    setStatus(await copyCardLink(score.code));
  }, [score.code, setStatus]);

  const caret = (
    <span className="caret" aria-hidden="true">
      {">"}
    </span>
  );

  const rows: { id: string; node: React.ReactNode }[] = [
    {
      id: "save",
      node: (
        <button type="button" className="menu-row" aria-disabled={saving || undefined} onClick={saveImage}>
          {caret}
          <SaveIcon className="ico" />
          <span>{saving ? "Saving" : "Save image"}</span>
        </button>
      ),
    },
    {
      id: "whatsapp",
      node: (
        <WhatsappShareButton url={url} title={text} separator=" " resetButtonStyle={false} className="menu-row">
          {caret}
          <ChatIcon className="ico" />
          <span>WhatsApp</span>
        </WhatsappShareButton>
      ),
    },
    {
      id: "x",
      node: (
        <TwitterShareButton url={url} title={text} resetButtonStyle={false} className="menu-row">
          {caret}
          <PostIcon className="ico" />
          <span>Post on X</span>
        </TwitterShareButton>
      ),
    },
    {
      id: "copy",
      node: (
        <button type="button" className="menu-row" onClick={copyLink}>
          {caret}
          <LinkIcon className="ico" />
          <span>Copy link</span>
        </button>
      ),
    },
    {
      id: "cable",
      node: friendCode ? (
        <Link href={`/journey/${friendCode}/${score.code}`} className="menu-row">
          {caret}
          <ClubIcon className="ico" />
          <span>Link cable</span>
          <span className="sub">
            Club cards <span className="dot" aria-hidden="true" />
          </span>
        </Link>
      ) : (
        <button type="button" className="menu-row" onClick={onLinkInfo}>
          {caret}
          <ClubIcon className="ico" />
          <span>Link cable</span>
        </button>
      ),
    },
    {
      id: "back",
      node: (
        <button type="button" className="menu-row" onClick={onBack}>
          {caret}
          <ArrowIcon dir="left" className="ico" />
          <span>Back to board</span>
        </button>
      ),
    },
  ];

  return (
    <>
      <ul className="menu" ref={listRef} aria-label="Share your card">
        {rows.map((row, i) => (
          <li
            key={row.id}
            data-row
            data-selected={selected === i}
            data-autofocus={selected === i}
            onFocus={() => onSelect(i)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") onSelect(i);
            }}
          >
            {row.node}
          </li>
        ))}
      </ul>
      <p role="status" className="lcd-status t-body-lcd" style={{ margin: 0 }}>
        {status.kind !== "idle"
          ? status.message
          : friendCode
            ? "A friend's card is waiting on the link cable."
            : ""}
      </p>
    </>
  );
}
