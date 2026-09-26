import { LogOut } from "lucide-react";

import { AdminLogin } from "@/components/admin-login";
import { AdminPanel } from "@/components/admin-panel";
import { DocHead, PageFoot, TopBand } from "@/components/datasheet";
import { isAdmin } from "@/lib/admin-session";
import { getDictionary } from "@/lib/i18n/server";

import { signOut } from "./actions";

export async function generateMetadata() {
  const { t } = await getDictionary();
  return { title: t.admin.metaTitle, robots: { index: false, follow: false } };
}

/**
 * Garage authorization, for the registry owner. Signed-out visitors get the
 * sign-in form; signed-in ones get the panel, which still needs the owner's
 * wallet to change anything on-chain.
 */
export default async function AdminPage() {
  const { t } = await getDictionary();
  const signedIn = await isAdmin();

  return (
    <>
      <TopBand current="admin" />
      <DocHead
        tag={t.admin.tag}
        meta={["Monad Testnet"]}
        partno="ADM-1"
        partnoSub={t.admin.partnoSub}
      />

      <main className="wrap pb-[clamp(48px,6vw,80px)] pt-[clamp(32px,5vw,56px)]">
        {signedIn ? (
          <div className="max-w-[980px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="display text-[clamp(34px,4.4vw,54px)]">
                {t.admin.titleA} <em>{t.admin.titleB}</em>
              </h1>
              <form action={signOut}>
                <button type="submit" className="btn btn-ghost">
                  <LogOut className="size-4" strokeWidth={2} />
                  {t.admin.signOut}
                </button>
              </form>
            </div>
            <p className="mb-10 mt-4 max-w-[62ch] text-[16px] text-ink-2">{t.admin.intro}</p>
            <AdminPanel />
          </div>
        ) : (
          <div className="mx-auto max-w-[420px]">
            <h1 className="display text-[clamp(34px,4.4vw,54px)]">
              {t.admin.loginTitleA} <em>{t.admin.loginTitleB}</em>
            </h1>
            <p className="mb-9 mt-4 text-[15px] text-ink-2">{t.admin.loginBody}</p>
            <AdminLogin />
          </div>
        )}
      </main>

      <PageFoot id={t.admin.tag} page={1} />
    </>
  );
}
