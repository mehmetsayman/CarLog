"use client";

import { Check, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isAddress } from "viem";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { explorerAddress, explorerTx, monadTestnet } from "@/lib/chain";
import { registry } from "@/lib/registry";
import { cn, shortAddress } from "@/lib/utils";

import { useT } from "./preferences";
import { SectionHeading } from "./section-heading";
import { WalletButton } from "./wallet-button";

type Provider = { name: string; recordCount: number; approvedAt: number; active: boolean };

/**
 * Approve, revoke and restore garages. Every button here is a transaction the
 * registry owner signs: the contract's `setServiceProvider` is `onlyOwner`, so the
 * panel checks the connected wallet first and says plainly when it is the wrong one.
 */
export function AdminPanel() {
  const t = useT();
  const { address, isConnected, chainId } = useAccount();
  const onRightNetwork = isConnected && chainId === monadTestnet.id;

  const { data: owner } = useReadContract({ ...registry, functionName: "owner" }) as {
    data: `0x${string}` | undefined;
  };
  const isOwner =
    onRightNetwork && !!address && !!owner && owner.toLowerCase() === address.toLowerCase();

  // Every address ever approved, then each one's name, record count and status.
  const { data: list, refetch: refetchList } = useReadContract({
    ...registry,
    functionName: "getServiceProviders",
  }) as { data: readonly `0x${string}`[] | undefined; refetch: () => void };

  const { data: details, refetch: refetchDetails } = useReadContracts({
    contracts: (list ?? []).map((provider) => ({
      ...registry,
      functionName: "getServiceProvider" as const,
      args: [provider] as const,
    })),
    query: { enabled: !!list && list.length > 0 },
  });

  const [target, setTarget] = useState("");
  const [name, setName] = useState("");
  const validTarget = isAddress(target);

  const { data: current, refetch: refetchCurrent } = useReadContract({
    ...registry,
    functionName: "getServiceProvider",
    args: validTarget ? [target] : undefined,
    query: { enabled: validTarget },
  }) as { data: Provider | undefined; refetch: () => void };

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  /** Which button started the transaction in flight: "grant", or a garage address. */
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [confirmMs, setConfirmMs] = useState<number | null>(null);
  const sentAt = useRef<number | null>(null);

  useEffect(() => {
    if (hash && sentAt.current === null) sentAt.current = Date.now();
  }, [hash]);

  useEffect(() => {
    if (isSuccess && sentAt.current !== null) {
      setConfirmMs(Date.now() - sentAt.current);
      sentAt.current = null;
      refetchList();
      refetchDetails();
      refetchCurrent();
    }
  }, [isSuccess, refetchList, refetchDetails, refetchCurrent]);

  const busy = isPending || isConfirming;

  function setProvider(provider: `0x${string}`, providerName: string, active: boolean, key: string) {
    reset();
    setConfirmMs(null);
    sentAt.current = null;
    setBusyKey(key);
    writeContract({
      ...registry,
      functionName: "setServiceProvider",
      args: [provider, providerName, active],
    });
  }

  const nameOk = name.trim().length > 0;
  const canGrant = isOwner && validTarget && nameOk && !busy;

  const garages = (list ?? [])
    .map((provider, index) => ({
      address: provider,
      info: details?.[index]?.result as Provider | undefined,
    }))
    .reverse();

  const errorText = error
    ? error.message.includes("OwnableUnauthorizedAccount")
      ? t.admin.notOwner(owner ? shortAddress(owner) : "—")
      : error.message.split("\n")[0]
    : null;

  return (
    <div className="space-y-12">
      {/* 1. The wallet that can sign */}
      <section>
        <SectionHeading n={1}>{t.admin.sectionWallet}</SectionHeading>
        {!onRightNetwork ? (
          <div className="flex flex-wrap items-center gap-4">
            <WalletButton />
            <p className="text-[14px] text-ink-2">{t.admin.needOwner}</p>
          </div>
        ) : isOwner ? (
          <p className="flex items-center gap-2 text-[15px] font-semibold text-green">
            <ShieldCheck className="size-5" strokeWidth={2} />
            {t.admin.ownerConnected}
            <span className="numeric font-normal text-ink-3">{shortAddress(address!)}</span>
          </p>
        ) : (
          <p className="border-l-[3px] border-red bg-red-wash px-4 py-3 text-[14px] font-semibold text-red-ink">
            {t.admin.notOwner(owner ? shortAddress(owner) : "—")}
          </p>
        )}
      </section>

      {/* 2. Grant access */}
      <section>
        <SectionHeading n={2}>{t.admin.sectionGrant}</SectionHeading>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <label className="block">
            <span className="label mb-2 block">{t.admin.address}</span>
            <div className="field" data-error={target && !validTarget ? "true" : undefined}>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value.trim())}
                placeholder="0x…"
                autoCorrect="off"
                spellCheck={false}
                className="numeric text-[14px]"
              />
            </div>
          </label>
          <label className="block">
            <span className="label mb-2 block">{t.admin.name}</span>
            <div className="field">
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 40))}
                placeholder={t.admin.namePlaceholder}
                className="text-[15px]"
              />
            </div>
          </label>
        </div>

        <div className="mt-3 min-h-[22px] text-[13.5px]">
          {target && !validTarget ? (
            <span className="text-red">{t.admin.badAddress}</span>
          ) : validTarget && current ? (
            <span className="text-ink-2">
              {t.admin.statusNow}:{" "}
              <StatusText provider={current} />
              {current.approvedAt > 0 && current.name && (
                <span className="text-ink-3"> · {current.name}</span>
              )}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          disabled={!canGrant}
          onClick={() => setProvider(target as `0x${string}`, name.trim(), true, "grant")}
          className="btn mt-4 w-full sm:w-auto"
        >
          {busy && busyKey === "grant" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" strokeWidth={2} />
          )}
          {busy && busyKey === "grant" ? t.common.confirmInWallet : t.admin.grant}
        </button>
        {validTarget && !nameOk && isOwner && (
          <p className="mt-2 text-[13px] text-ink-3">{t.admin.needName}</p>
        )}

        <TxResult
          show={!!busyKey}
          hash={hash}
          confirmMs={confirmMs}
          errorText={errorText}
          confirmedLabel={confirmMs !== null ? t.admin.confirmed(confirmMs) : null}
        />
      </section>

      {/* 3. Everyone ever approved */}
      <section>
        <SectionHeading n={3}>{t.admin.sectionList}</SectionHeading>
        {!list ? (
          <p className="flex items-center gap-2 text-[14px] text-ink-2">
            <Loader2 className="size-4 animate-spin text-red" />
            {t.admin.loadingList}
          </p>
        ) : garages.length === 0 ? (
          <p className="text-[14px] text-ink-2">{t.admin.empty}</p>
        ) : (
          <div className="tbl-wrap">
            <table className="ds">
              <caption>
                <span className="cap-n">{t.common.table} 1.</span> {t.admin.listTable}
              </caption>
              <thead>
                <tr>
                  <th>{t.admin.colName}</th>
                  <th>{t.admin.colAddress}</th>
                  <th className="text-right">{t.admin.colRecords}</th>
                  <th>{t.admin.colStatus}</th>
                  <th className="text-right">{t.admin.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {garages.map(({ address: garage, info }) => {
                  const rowBusy = busy && busyKey === garage;
                  return (
                    <tr key={garage}>
                      <td className="font-semibold text-ink">{info?.name || "—"}</td>
                      <td>
                        <a
                          href={explorerAddress(garage)}
                          target="_blank"
                          rel="noreferrer"
                          className="numeric inline-flex items-center gap-1 text-ink underline decoration-hair underline-offset-4 hover:decoration-red"
                        >
                          {shortAddress(garage)}
                          <ExternalLink className="size-3 text-ink-3" />
                        </a>
                      </td>
                      <td className="numeric text-right">{info ? Number(info.recordCount) : "…"}</td>
                      <td className="whitespace-nowrap">
                        {info ? <StatusText provider={info} /> : "…"}
                      </td>
                      <td className="text-right">
                        {info && (
                          <button
                            type="button"
                            disabled={!isOwner || busy}
                            onClick={() => setProvider(garage, info.name, !info.active, garage)}
                            className={cn(
                              "inline-flex items-center gap-1.5 border-[1.5px] px-2.5 py-1 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                              info.active
                                ? "border-red text-red hover:bg-red hover:text-white"
                                : "border-ink text-ink hover:bg-ink hover:text-paper",
                            )}
                          >
                            {rowBusy && <Loader2 className="size-3.5 animate-spin" />}
                            {info.active ? t.admin.revoke : t.admin.restore}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusText({ provider }: { provider: Provider }) {
  const t = useT();
  if (Number(provider.approvedAt) === 0) {
    return <span className="text-ink-3">{t.admin.statusNone}</span>;
  }
  return provider.active ? (
    <span className="font-semibold text-green">● {t.admin.statusActive}</span>
  ) : (
    <span className="font-semibold text-amber">○ {t.admin.statusRevoked}</span>
  );
}

function TxResult({
  show,
  hash,
  confirmMs,
  errorText,
  confirmedLabel,
}: {
  show: boolean;
  hash: `0x${string}` | undefined;
  confirmMs: number | null;
  errorText: string | null;
  confirmedLabel: string | null;
}) {
  if (!show) return null;
  if (errorText) {
    return (
      <p className="mt-4 border-l-[3px] border-red bg-red-wash px-4 py-3 text-[14px] font-semibold text-red-ink">
        {errorText}
      </p>
    );
  }
  if (confirmMs === null || !hash) return null;
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
      <span className="flex items-center gap-1.5 font-semibold text-green">
        <Check className="size-4" strokeWidth={3} />
        {confirmedLabel}
      </span>
      <a
        href={explorerTx(hash)}
        target="_blank"
        rel="noreferrer"
        className="numeric text-ink-2 underline decoration-hair underline-offset-4 hover:decoration-red"
      >
        {hash.slice(0, 10)}…{hash.slice(-6)}
      </a>
    </p>
  );
}
