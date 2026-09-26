import { DocHead, PageFoot, SectionHeading, TopBand } from "@/components/datasheet";
import { VinSearch } from "@/components/vin-search";
import { getDictionary } from "@/lib/i18n/server";

/** Any address the app does not have: the sheet's look, and a way back to work. */
export default async function NotFound() {
  const { t } = await getDictionary();

  return (
    <>
      <TopBand />
      <DocHead tag={t.missingPage.tag} meta={["404"]} partno="—" partnoSub="CarLog" />

      <main className="wrap py-[clamp(48px,7vw,96px)]">
        <div className="max-w-[640px]">
          <h1 className="display text-[clamp(34px,4.4vw,58px)]">
            {t.missingPage.titleA} <em>{t.missingPage.titleB}</em>
          </h1>
          <p className="mt-5 text-[16px] text-ink-2">{t.missingPage.body}</p>

          <div className="mt-11">
            <SectionHeading n={1}>{t.actions.lookup}</SectionHeading>
            <VinSearch />
          </div>
        </div>
      </main>

      <PageFoot id="404" page={1} />
    </>
  );
}
