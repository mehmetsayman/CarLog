import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, FileCode2, Search, ShieldCheck, UserCog, Wrench } from "lucide-react";

import { explorerAddress } from "@/lib/chain";
import { getDictionary } from "@/lib/i18n/server";
import { registryAddress } from "@/lib/registry";

import { ChipMark } from "./chip-mark";
import { LanguageToggle, ThemeToggle } from "./preferences";
// Shared with client components, so it lives apart from the server-only chrome.
export { SectionHeading } from "./section-heading";
import { WalletButton } from "./wallet-button";

/*
 * The furniture of a datasheet page, shared by every screen: the red band on
 * top, the document head with its part number, the row of document links, and
 * the running foot. Pages supply the words; this supplies the form.
 */

const SOURCIFY = `https://sourcify.dev/server/repo-ui/10143/${registryAddress}`;

/** The solid red band across the top of every page. */
export async function TopBand({ current }: { current?: "search" | "report" | "admin" }) {
  const { t } = await getDictionary();
  const links = [
    { href: "/", label: t.nav.search, key: "search" },
    { href: "/report", label: t.nav.garage, key: "report" },
    { href: "/admin", label: t.nav.admin, key: "admin" },
  ] as const;

  return (
    <div className="bg-brand text-white">
      <div className="wrap flex h-[54px] items-center gap-4 sm:gap-7">
        <Link
          href="/"
          aria-label="CarLog"
          className="flex shrink-0 items-center gap-2.5 text-white"
        >
          <ChipMark className="size-6" />
          <span
            className="hidden text-[17px] font-extrabold tracking-[0.14em] sm:inline"
            style={{ fontVariationSettings: '"wdth" 110' }}
          >
            CARLOG
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-[14.5px] lg:flex" aria-label={t.nav.aria}>
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={current === link.key ? "page" : undefined}
              className={
                current === link.key
                  ? "font-semibold text-white underline decoration-2 underline-offset-[6px]"
                  : "text-white/85 transition hover:text-white"
              }
            >
              {link.label}
            </Link>
          ))}
          <a
            href={explorerAddress(registryAddress)}
            target="_blank"
            rel="noreferrer"
            className="text-white/85 transition hover:text-white"
          >
            {t.nav.contract}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
          <WalletButton variant="on-red" />
        </div>
      </div>
    </div>
  );
}

/**
 * The head of a document: an outlined tag, a line of metadata, and a part
 * number set large on the right.
 */
export function DocHead({
  tag,
  meta,
  partno,
  partnoSub,
}: {
  tag: string;
  meta: ReactNode[];
  partno: ReactNode;
  partnoSub: ReactNode;
}) {
  return (
    <div className="border-b-[1.5px] border-ink">
      <div className="wrap grid grid-cols-1 items-end gap-5 pb-3 pt-6 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1.5 text-[12.5px] text-ink-2">
          <span className="tag">{tag}</span>
          {meta.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </div>
        <div className="sm:text-right">
          <p className="partno text-[clamp(34px,4.4vw,54px)]">{partno}</p>
          <p
            className="mt-1.5 text-[12px] font-medium tracking-[0.04em] text-ink-3"
            style={{ fontVariationSettings: '"wdth" 100' }}
          >
            {partnoSub}
          </p>
        </div>
      </div>
    </div>
  );
}

/** The row of document links under the head, divided by hairlines. */
export async function ActionsBar() {
  const { t } = await getDictionary();
  const items = [
    { href: "/", label: t.actions.lookup, icon: Search, external: false },
    { href: "/report", label: t.actions.garage, icon: Wrench, external: false },
    { href: "/admin", label: t.actions.admin, icon: UserCog, external: false },
    {
      href: explorerAddress(registryAddress),
      label: t.actions.contract,
      icon: FileCode2,
      external: true,
    },
    { href: SOURCIFY, label: t.actions.verified, icon: ShieldCheck, external: true },
    {
      href: "https://github.com/mehmetsayman/CarLog",
      label: t.actions.docs,
      icon: BookOpen,
      external: true,
    },
  ];

  return (
    <div className="border-b border-hair bg-paper-2">
      <div className="wrap">
        <ul className="flex flex-wrap">
          {items.map(({ href, label, icon: Icon, external }, index) => (
            <li
              key={label}
              className={`border-r border-hair ${index === 0 ? "border-l" : ""}`}
            >
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="flex items-center gap-2.5 px-[18px] py-3 text-[14px] font-semibold text-ink transition hover:bg-band"
              >
                <Icon className="size-4 text-red" strokeWidth={1.8} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** The running foot of a datasheet page. */
export async function PageFoot({ id, page }: { id: ReactNode; page: number }) {
  const { t } = await getDictionary();
  return (
    <div className="pagefoot">
      <div className="wrap">
        <span>
          <b>CL-1</b> · {id}
        </span>
        <a
          href="https://github.com/mehmetsayman/CarLog/issues"
          target="_blank"
          rel="noreferrer"
          className="hidden transition hover:text-ink sm:inline"
        >
          {t.foot.feedback}
        </a>
        <span className="flex items-center gap-4">
          <Link href="/admin" className="transition hover:text-ink">
            {t.admin.footLink}
          </Link>
          <span className="numeric text-ink">{page}</span>
        </span>
      </div>
    </div>
  );
}
