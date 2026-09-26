"use client";

import { ArrowRight, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { ChipMark } from "@/components/chip-mark";
import { LanguageToggle, ThemeToggle, useT } from "@/components/preferences";

/**
 * What a visitor sees when a page cannot be built - in practice, when the public
 * Monad RPC turns the server away for a moment. It says so plainly, keeps the
 * sheet's look, and offers the one thing that usually fixes it: trying again.
 *
 * Error boundaries run in the browser, so this draws its own copy of the top
 * band rather than the server-rendered one.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <div className="bg-brand text-white">
        <div className="wrap flex h-[54px] items-center gap-4">
          <Link href="/" aria-label="CarLog" className="flex items-center gap-2.5 text-white">
            <ChipMark className="size-6" />
            <span
              className="hidden text-[17px] font-extrabold tracking-[0.14em] sm:inline"
              style={{ fontVariationSettings: '"wdth" 110' }}
            >
              CARLOG
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="wrap py-[clamp(48px,7vw,96px)]">
        <div className="max-w-[640px]">
          <span className="tag">{t.errorPage.tag}</span>
          <h1 className="display mt-6 text-[clamp(34px,4.4vw,58px)]">
            {t.errorPage.titleA} <em>{t.errorPage.titleB}</em>
          </h1>
          <p className="mt-5 text-[16px] text-ink-2">{t.errorPage.body}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => retry()} className="btn">
              <RotateCw className="size-4" strokeWidth={2} />
              {t.errorPage.retry}
            </button>
            <Link href="/" className="btn btn-ghost">
              {t.errorPage.home}
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
          </div>

          {error.digest && (
            <p className="numeric mt-8 text-[12px] text-ink-3">ref {error.digest}</p>
          )}
        </div>
      </main>
    </>
  );
}
