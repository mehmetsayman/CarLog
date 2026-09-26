"use client";

import { Check, Copy, Loader2, LogOut, Smartphone } from "lucide-react";
import { useState } from "react";

import { shortAddress } from "@/lib/utils";

import { useT } from "./preferences";
import { useUstaSession } from "./usta-session";
import { WalletButton } from "./wallet-button";

/** The two ways in: phone / e-mail (gas paid by the platform) or MetaMask. */
export function SignInOptions() {
  const t = useT();
  const session = useUstaSession();

  if (session.phonePreparing) {
    return (
      <p className="flex items-center gap-2 text-[15px] text-ink-2">
        <Loader2 className="size-4 animate-spin text-red" />
        {t.form.preparing}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {session.phoneAvailable && (
        <div>
          <button
            type="button"
            onClick={session.loginWithPhone}
            className="btn w-full py-4 text-[16px]"
          >
            <Smartphone className="size-5" strokeWidth={2} />
            {t.form.phoneLogin}
          </button>
          <p className="mt-2 text-[13px] text-ink-3">{t.form.phoneLoginHint}</p>
        </div>
      )}
      <div className={session.phoneAvailable ? "border-t border-hair pt-4" : undefined}>
        {session.phoneAvailable && <p className="label mb-2">{t.form.orWallet}</p>}
        <WalletButton className="w-full sm:w-auto" />
      </div>
    </div>
  );
}

/** Shown while signed in by phone: who, that gas is covered, and a way out. */
export function PhoneBar() {
  const t = useT();
  const session = useUstaSession();
  if (session.mode !== "phone") return null;

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-[1.5px] border-ink px-4 py-3">
      <div className="min-w-0 text-[14px]">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Smartphone className="size-4 shrink-0 text-red" strokeWidth={2} />
          {t.form.signedInAs(session.identity ?? shortAddress(session.address!))}
        </p>
        <p className="mt-0.5 text-[12.5px] text-green">● {t.form.gasFree}</p>
      </div>
      <button type="button" onClick={session.logout} className="btn btn-ghost px-3 py-2 text-[13px]">
        <LogOut className="size-3.5" />
        {t.form.signOut}
      </button>
    </div>
  );
}

/** The garage's address, big enough to read out and one tap to copy. */
export function AddressToShare({ address }: { address: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div className="flex items-stretch border-[1.5px] border-ink">
        <code className="numeric min-w-0 flex-1 break-all bg-paper-2 px-3 py-2 text-[13px] text-ink">
          {address}
        </code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(address).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="flex shrink-0 items-center gap-1.5 border-l-[1.5px] border-ink px-3 text-[13px] font-semibold text-ink transition hover:bg-ink hover:text-paper"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? t.form.copied : t.form.copy}
        </button>
      </div>
      <p className="mt-2 text-[13px] text-ink-3">{t.form.giveAddress}</p>
    </div>
  );
}
