"use client";

import { AlertTriangle, ExternalLink, LogOut, Wallet, X } from "lucide-react";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

import { monadTestnet } from "@/lib/chain";
import { cn, shortAddress } from "@/lib/utils";

import { useT } from "./preferences";

/**
 * Connect, switch network, or show who is connected.
 *
 * Two surfaces: white on the red top band, black on paper. Same states on both.
 *
 * When there is no wallet to connect to, it says so instead of doing nothing -
 * and on a phone it offers to reopen the page inside the MetaMask app, which is
 * how a garage on a workshop floor actually gets in.
 */
export function WalletButton({
  variant = "default",
  className,
}: {
  variant?: "default" | "on-red";
  className?: string;
}) {
  const t = useT();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [problem, setProblem] = useState<Problem | null>(null);
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const injected = connectors[0];
  const wrongNetwork = isConnected && chainId !== monadTestnet.id;
  const onRed = variant === "on-red";

  function start() {
    setProblem(null);
    if (!injected || !hasInjectedWallet()) {
      setProblem(noWalletProblem());
      return;
    }
    connect(
      { connector: injected },
      {
        onError: (error) => {
          // wagmi's error union is narrower than what wallets actually throw.
          const name: string = error.name;
          if (name === "UserRejectedRequestError") setProblem({ kind: "rejected" });
          else if (name === "ProviderNotFoundError") setProblem(noWalletProblem());
          else setProblem({ kind: "failed" });
        },
      },
    );
  }

  if (!isConnected) {
    return (
      <span className={cn("relative inline-flex shrink-0", className)}>
        <button
          type="button"
          disabled={isPending}
          onClick={start}
          className={cn("btn w-full", onRed && "btn-on-red")}
        >
          <Wallet className="size-4" strokeWidth={2} />
          {isPending ? t.wallet.connecting : t.wallet.connect}
        </button>

        {problem && (
          <span
            role="alert"
            className="absolute right-0 top-full z-50 mt-2 block w-[280px] max-w-[calc(100vw-32px)] border-[1.5px] border-ink bg-paper p-3.5 text-left text-[13.5px] font-normal text-ink shadow-[4px_4px_0_0_var(--color-ink)]"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="font-semibold">
                {problem.kind === "rejected"
                  ? t.wallet.rejected
                  : problem.kind === "failed"
                    ? t.wallet.failed
                    : t.wallet.noWallet}
              </span>
              <button
                type="button"
                onClick={() => setProblem(null)}
                aria-label="×"
                className="-m-1 p-1 text-ink-3 hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </span>
            {problem.kind === "no-wallet" && (
              <a
                href={problem.href}
                target={problem.mobile ? undefined : "_blank"}
                rel="noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 font-semibold text-red underline underline-offset-4"
              >
                {problem.mobile ? t.wallet.openInApp : t.wallet.installWallet}
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </span>
        )}
      </span>
    );
  }

  if (wrongNetwork) {
    return (
      <button
        type="button"
        disabled={isSwitching}
        onClick={() => switchChain({ chainId: monadTestnet.id })}
        className={cn("btn shrink-0", onRed && "btn-on-red", className)}
      >
        <AlertTriangle className="size-4" strokeWidth={2} />
        {isSwitching ? t.wallet.switching : t.wallet.switchNetwork}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center border-[1.5px]",
        onRed ? "border-white text-white" : "border-ink text-ink",
        className,
      )}
    >
      <span className="flex items-center gap-2 px-3 py-[7px]">
        <span className={cn("size-2", onRed ? "bg-white" : "bg-green")} aria-hidden="true" />
        <span className="numeric text-[13px]">{shortAddress(address!)}</span>
      </span>
      <button
        type="button"
        onClick={() => disconnect()}
        aria-label={t.wallet.disconnect}
        className={cn(
          "self-stretch border-l-[1.5px] px-2.5 transition",
          onRed
            ? "border-white hover:bg-white hover:text-brand"
            : "border-ink hover:bg-ink hover:text-paper",
        )}
      >
        <LogOut className="size-3.5" />
      </button>
    </div>
  );
}

type Problem =
  | { kind: "no-wallet"; mobile: boolean; href: string }
  | { kind: "rejected" }
  | { kind: "failed" };

function hasInjectedWallet() {
  return typeof window !== "undefined" && "ethereum" in window && Boolean(window.ethereum);
}

/** On a phone, the fix is the MetaMask app's own browser; elsewhere, installing it. */
function noWalletProblem(): Problem {
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const here = `${window.location.host}${window.location.pathname}`;
  return {
    kind: "no-wallet",
    mobile,
    href: mobile ? `https://metamask.app.link/dapp/${here}` : "https://metamask.io/download/",
  };
}

declare global {
  interface Window {
    ethereum?: unknown;
  }
}
