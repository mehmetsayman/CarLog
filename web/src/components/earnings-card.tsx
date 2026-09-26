"use client";

import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useBalance, useReadContract } from "wagmi";

import { explorerAddress, explorerTx } from "@/lib/chain";
import { registry } from "@/lib/registry";
import { shortAddress } from "@/lib/utils";

import { useT } from "./preferences";
import { useRegistryWrite, useUstaSession } from "./usta-session";

/** 0.699999… -> "0.7"; enough precision for MON on a phone screen. */
function mon(value: bigint) {
  const [whole, fraction = ""] = formatEther(value).split(".");
  const trimmed = fraction.slice(0, 4).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

/**
 * The garage's own account: where it lives, what is in it, and what it has
 * earned from buyers opening reports on cars it worked on.
 *
 * A withdrawal used to end with the number dropping to zero and nothing else,
 * which reads like money vanishing. Now it says where the money went - this
 * account - and links the transaction that moved it.
 */
export function EarningsCard() {
  const t = useT();
  const { address, ready } = useUstaSession();
  const [copied, setCopied] = useState(false);
  const [withdrawn, setWithdrawn] = useState<bigint | null>(null);

  const { data: owed, refetch: refetchOwed } = useReadContract({
    ...registry,
    functionName: "earnings",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && ready },
  });

  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    query: { enabled: Boolean(address) && ready },
  });

  const { write, hash, isPending, isConfirming, isSuccess } = useRegistryWrite();

  useEffect(() => {
    if (isSuccess) {
      refetchOwed();
      refetchBalance();
    }
  }, [isSuccess, refetchOwed, refetchBalance]);

  if (!ready || !address || owed === undefined) return null;

  const pending = owed as bigint;
  const busy = isPending || isConfirming;

  return (
    <section className="mb-10 border-[1.5px] border-ink">
      {/* Who: the account, copyable, with a way to see it on the explorer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair px-4 py-3">
        <div className="min-w-0">
          <p className="label">{t.garage.account}</p>
          <p className="numeric mt-1 text-[14px] text-ink">{shortAddress(address)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(address).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="inline-flex items-center gap-1.5 border-[1.5px] border-ink px-2.5 py-1.5 text-[12.5px] font-semibold text-ink transition hover:bg-ink hover:text-paper"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? t.garage.copiedAddress : t.garage.copyAddress}
          </button>
          <a
            href={explorerAddress(address)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border-[1.5px] border-ink px-2.5 py-1.5 text-[12.5px] font-semibold text-ink transition hover:bg-ink hover:text-paper"
          >
            {t.garage.viewOnExplorer}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>

      {/* What: money already in the account, and money waiting in the registry */}
      <div className="grid grid-cols-2">
        <div className="border-r border-hair px-4 py-4">
          <p className="label">{t.garage.accountBalance}</p>
          <p className="mt-1.5 flex items-baseline gap-1.5">
            <span className="partno text-[34px] leading-none">
              {balance ? mon(balance.value) : "…"}
            </span>
            <span className="numeric text-[13px] text-ink-3">MON</span>
          </p>
        </div>
        <div className="px-4 py-4">
          <p className="label">{t.garage.withdrawable}</p>
          <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3">
            <p className="flex items-baseline gap-1.5">
              <span className="partno text-[34px] leading-none">{mon(pending)}</span>
              <span className="numeric text-[13px] text-ink-3">MON</span>
            </p>
            {pending > 0n && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setWithdrawn(pending);
                  void write("withdrawEarnings", []);
                }}
                className="btn px-4 py-2.5"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? t.garage.withdrawing : t.garage.withdraw}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Where it went */}
      {isSuccess && withdrawn !== null && hash && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-hair bg-paper-2 px-4 py-3 text-[14px]">
          <span className="flex items-center gap-1.5 font-semibold text-green">
            <Check className="size-4" strokeWidth={3} />
            {t.garage.withdrawn(mon(withdrawn))}
          </span>
          <a
            href={explorerTx(hash)}
            target="_blank"
            rel="noreferrer"
            className="numeric text-[13px] text-ink-2 underline decoration-hair underline-offset-4 hover:decoration-red"
          >
            {hash.slice(0, 10)}…{hash.slice(-6)}
          </a>
        </div>
      )}
    </section>
  );
}
