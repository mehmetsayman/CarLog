import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatEther } from "viem";

import {
  ActionsBar,
  DocHead,
  PageFoot,
  SectionHeading,
  TopBand,
} from "@/components/datasheet";
import { CarDrawing } from "@/components/car-drawing";
import { VinSearch } from "@/components/vin-search";
import { explorerAddress } from "@/lib/chain";
import { getDictionary } from "@/lib/i18n/server";
import { registryAddress } from "@/lib/registry";
import { loadReportPrice } from "@/lib/server";
import { shortAddress } from "@/lib/utils";

export default async function HomePage() {
  const { t } = await getDictionary();
  // Terms are read from the chain, so the table never quotes a stale price.
  const priceWei = await loadReportPrice();
  const price = priceWei ? `${formatEther(BigInt(priceWei))} MON` : "—";

  return (
    <>
      <TopBand current="search" />
      <DocHead
        tag={t.home.tag}
        meta={[
          <span key="id" className="numeric">
            CLR001A
          </span>,
          t.home.date,
          t.home.onChain,
        ]}
        partno="CL-1"
        partnoSub={t.home.partnoSub}
      />
      <ActionsBar />

      <main>
        {/* --- hero ------------------------------------------------------ */}
        <section className="wrap grid gap-12 py-[clamp(40px,6vw,72px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16">
          <div>
            <h1 className="display mb-7 text-[clamp(38px,4.6vw,66px)]">
              {t.home.titleA} <em>{t.home.titleB}</em>
            </h1>

            <VinSearch />

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/report" className="btn">
                {t.home.goGarage}
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
              <Link href="/vehicle/1HGBH41JXMN109186" className="btn btn-ghost">
                {t.home.sampleReport}
              </Link>
            </div>

            <div className="mt-11">
              <SectionHeading n={1}>{t.home.features}</SectionHeading>
              <ul className="features">
                {t.home.featureList.map((feature) => (
                  <li key={feature.b}>
                    <b>{feature.b}</b> {feature.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:pt-2">
            <CarDrawing />
          </div>
        </section>

        {/* --- applications and device table ------------------------------ */}
        <section className="wrap border-t border-hair pb-[clamp(40px,5vw,64px)] pt-9">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <SectionHeading n={2}>{t.home.who}</SectionHeading>
              <ul className="dashes columns-2 gap-6 md:columns-1 xl:columns-2">
                {t.home.whoList.map((who) => (
                  <li key={who}>{who}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="tbl-wrap">
                <table className="ds">
                  <caption>
                    <span className="cap-n">{t.common.table} 1.</span> {t.home.registryTable}
                  </caption>
                  <thead>
                    <tr>
                      <th>{t.common.parameter}</th>
                      <th>{t.common.value}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{t.home.network}</td>
                      <td className="numeric text-ink">Monad Testnet · 10143</td>
                    </tr>
                    <tr>
                      <td>{t.home.contract}</td>
                      <td>
                        <a
                          href={explorerAddress(registryAddress)}
                          target="_blank"
                          rel="noreferrer"
                          className="numeric text-ink underline decoration-hair underline-offset-4 hover:decoration-red"
                        >
                          {shortAddress(registryAddress)}
                        </a>
                      </td>
                    </tr>
                    <tr className="hl">
                      <td>{t.home.price}</td>
                      <td className="numeric font-semibold">{price}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PageFoot id={t.home.footId} page={1} />

      {/* --- the dark band a datasheet closes on --------------------------- */}
      <section className="close-band">
        <div className="wrap grid gap-10 py-[clamp(56px,7vw,96px)] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <h2 className="display text-[clamp(40px,5.2vw,72px)]">
            {t.home.closeA} <em>{t.home.closeB}</em>
          </h2>
          <div>
            <p className="mb-7 max-w-[48ch] text-[17px] text-[#c4c4bd]">
              {t.home.closeBody}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/vehicle/1HGBH41JXMN109186"
                className="btn border-[#f2f2ee] bg-[#f2f2ee] text-[#121212] hover:border-brand hover:bg-brand hover:text-white"
              >
                {t.home.openSample}
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
              <Link
                href="/report"
                className="btn btn-ghost border-[#f2f2ee] text-[#f2f2ee] hover:border-[#f2f2ee] hover:bg-[#f2f2ee] hover:text-[#121212]"
              >
                {t.home.garagePanel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
