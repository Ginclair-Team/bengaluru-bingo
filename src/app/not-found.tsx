import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[472px] px-3 pb-10 sm:px-4 lg:max-w-[1040px] lg:px-8">
      <SiteHeader />
      <main className="py-10">
        <h1 className="display text-3xl">That card isn't on the board</h1>
        <p className="mt-3 max-w-[36rem] text-sm font-semibold">
          The link is incomplete or was mistyped. Ask your friend to send it again, or stamp a card
          of your own.
        </p>
        <Link href="/" className="btn btn--primary mt-5">
          Stamp my own card
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
