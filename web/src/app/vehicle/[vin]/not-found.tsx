import { DocHead, PageFoot, SectionHeading, TopBand } from "@/components/datasheet";
import { VinSearch } from "@/components/vin-search";
import { getDictionary } from "@/lib/i18n/server";

/**
 * An unknown VIN is not an error. It is the honest answer to a fair question,
 * and it still tells the buyer something: nobody has put this car on the
 * registry yet.
 */
export default async function VehicleNotFound() {
  const { t } = await getDictionary();
  return (
    <>
      <TopBand />
      <DocHead
        tag={t.notFound.tag}
        meta={[t.notFound.queryResult, "Monad Testnet"]}
        partno="—"
        partnoSub={t.notFound.notRegistered}
      />

      <main className="wrap py-[clamp(48px,7vw,96px)]">
        <div className="max-w-[640px]">
          <h1 className="display text-[clamp(34px,4.4vw,58px)]">
            {t.notFound.titleA} <em>{t.notFound.titleB}</em>
          </h1>

          <div className="mt-6 border-l-[3px] border-red bg-red-wash px-4 py-3 text-[15px] text-ink">
            {t.notFound.note}
          </div>

          <div className="mt-11">
            <SectionHeading n={1}>{t.notFound.tryAnother}</SectionHeading>
            <VinSearch autoFocus />
          </div>
        </div>
      </main>

      <PageFoot id={t.notFound.queryResult} page={1} />
    </>
  );
}
