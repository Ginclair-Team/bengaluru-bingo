import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardScorecard } from "@/games/bingo/cards/CardScorecard";
import { ClubActions } from "@/games/bingo/ClubActions";
import { ScreenFrame } from "@/console/device/ScreenFrame";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { decodeMarks, scoreFor } from "@/games/bingo/rules";

type Props = { params: { code: string } };

export function generateMetadata({ params }: Props): Metadata {
  const marks = decodeMarks(params.code);
  if (marks === null) return { title: "Card not found, Bengaluru Pocket" };
  const score = scoreFor(marks);
  const title = `${score.percent}% Bengaluru native: ${score.badge}`;
  return {
    title: `${title}, Bengaluru Pocket`,
    description: "A Bengaluru Bingo scorecard from Bengaluru Pocket. Stamp your own card and compare.",
    openGraph: {
      title,
      description: "Stamp your own Bengaluru Bingo card and compare.",
      images: [{ url: `/api/scorecard/${score.code}`, width: 500, height: 700 }],
    },
  };
}

export default function CardPage({ params }: Props) {
  const marks = decodeMarks(params.code);
  if (marks === null) notFound();
  const score = scoreFor(marks);

  return (
    <div className="mx-auto max-w-[472px] px-4 pb-10 lg:max-w-[1040px] lg:px-8">
      <SiteHeader />
      <main className="lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-14">
        <ScreenFrame className="screen-frame--on-desk">
          <CardScorecard marks={marks} className="scorecard" />
        </ScreenFrame>
        <div className="mt-8 lg:mt-0 lg:max-w-[30rem]">
          <h1 className="wordmark t-display-xl" style={{ textShadow: "3px 3px 0 var(--cursor)" }}>
            A friend is {score.percent}% Bengaluru native
          </h1>
          <p className="t-body mt-5">
            They stamped {score.marked} of 25 tiles and earned the {score.badge} badge. Stamp your
            own card to see where you two overlap.
          </p>
          <div className="mt-6">
            <ClubActions friendCode={score.code} />
          </div>
        </div>
      </main>
      <SiteFooter className="mt-10" />
    </div>
  );
}
