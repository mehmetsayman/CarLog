"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { isCompleteVin, normalizeVin } from "@/lib/registry";
import { cn } from "@/lib/utils";

import { useT } from "./preferences";

/** The seeded demo vehicles, in the order of the dictionary's example labels. */
const EXAMPLES = ["WVWZZZ1JZXW000002", "NM0GE9F79E1234567", "1HGBH41JXMN109186"];

/**
 * The query box, drawn like the install command on a datasheet: one ruled row,
 * the input, and the action fused to its right edge.
 */
export function VinSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const t = useT();
  const router = useRouter();
  const [vin, setVin] = useState("");
  const [busy, setBusy] = useState(false);

  const ready = isCompleteVin(vin);

  function go(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    router.push(`/vehicle/${normalizeVin(vin)}`);
  }

  return (
    <div className="w-full">
      <form onSubmit={go} className="flex border-[1.5px] border-ink bg-paper">
        <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <Search className="size-4 shrink-0 text-ink-3" strokeWidth={2} />
          <span className="sr-only">{t.search.label}</span>
          <input
            value={vin}
            autoFocus={autoFocus}
            onChange={(e) => setVin(normalizeVin(e.target.value).slice(0, 17))}
            placeholder={t.search.placeholder}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="numeric w-full min-w-0 bg-transparent py-3.5 text-[15px] tracking-[0.04em] text-ink outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-3"
          />
          <span className="numeric shrink-0 text-[12px] text-ink-3">{vin.length}/17</span>
        </label>
        <button
          type="submit"
          disabled={!ready || busy}
          className={cn(
            "flex shrink-0 items-center gap-2 border-l-[1.5px] border-ink px-5 text-[14px] font-semibold transition",
            ready && !busy
              ? "bg-ink text-paper hover:bg-brand hover:text-white"
              : "cursor-not-allowed bg-paper-2 text-ink-3",
          )}
        >
          {busy ? t.search.searching : t.search.submit}
          {!busy && <ArrowRight className="size-4" strokeWidth={2} />}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="label">{t.search.examples}</span>
        {EXAMPLES.map((example, index) => (
          <button
            key={example}
            type="button"
            onClick={() => setVin(example)}
            className="border border-hair bg-paper px-2.5 py-1 text-[13px] text-ink-2 transition hover:border-ink hover:text-ink"
          >
            {t.search.exampleLabels[index]}
          </button>
        ))}
      </div>
    </div>
  );
}
