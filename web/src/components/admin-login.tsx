"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useActionState } from "react";

import { signIn, type LoginState } from "@/app/admin/actions";

import { useT } from "./preferences";

export function AdminLogin() {
  const t = useT();
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, null);

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="label mb-2 block">{t.admin.username}</span>
        <div className="field" data-error={state?.failed ? "true" : undefined}>
          <input
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            className="text-[16px]"
          />
        </div>
      </label>

      <label className="block">
        <span className="label mb-2 block">{t.admin.password}</span>
        <div className="field" data-error={state?.failed ? "true" : undefined}>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="text-[16px]"
          />
        </div>
      </label>

      {state?.failed && (
        <p
          role="alert"
          className="border-l-[3px] border-red bg-red-wash px-4 py-3 text-[14px] font-semibold text-red-ink"
        >
          {t.admin.badLogin}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn w-full py-4">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t.admin.signingIn}
          </>
        ) : (
          <>
            {t.admin.signIn}
            <ArrowRight className="size-4" strokeWidth={2} />
          </>
        )}
      </button>
    </form>
  );
}
