import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeasonalScorecard } from "@/components/Cards/SeasonalScorecard";
import { ClubActions } from "@/components/ClubActions";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { decodeMarks, scoreFor } from "@/lib/game";

type Props = { params: { code: string } };

export function generateMetadata({ params }: Props): Metadata {
  const marks = decodeMarks(params.code);
  if (marks === null) return { title: "Card not found, Bengaluru Bingo" };
  const score = scoreFor(marks);
  const title = `${score.percent}% Bengaluru native: ${score.badge}`;
  return {
    title: `${title}, Bengaluru Bingo`,
    description: "A Bengaluru Bingo scorecard from Ginhouse. Stamp your own card and compare.",
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
    <div className="mx-auto max-w-[472px] px-3 pb-10 sm:px-4 lg:max-w-[1040px] lg:px-8">
      <SiteHeader />
      <main className="lg:grid lg:grid-cols-[440px_minmax(0,1fr)] lg:items-start lg:gap-14">
        <SeasonalScorecard marks={marks} />
        <div className="mt-5 lg:mt-0 lg:max-w-[30rem]">
          <h1 className="display text-2xl lg:text-4xl">
            A friend is {score.percent}% Bengaluru native
          </h1>
          <p className="mt-3 text-sm font-semibold">
            They stamped {score.marked} of 25 tiles and earned the {score.badge} badge. Stamp your
            own card to see where you two overlap.
          </p>
          <div className="mt-5">
            <ClubActions friendCode={score.code} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
