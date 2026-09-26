import { DocHead, PageFoot, TopBand } from "@/components/datasheet";
import { EarningsCard } from "@/components/earnings-card";
import { ReportForm } from "@/components/report-form";
import { UstaSessionProvider } from "@/components/usta-session";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getDictionary();
  return { title: t.meta.reportTitle };
}

/**
 * The garage screen. Built for a phone held in one hand in a workshop: one
 * column, large targets, and a single button that ends the job.
 */
export default async function ReportPage() {
  const { t } = await getDictionary();
  return (
    <>
      <TopBand current="report" />
      <DocHead
        tag={t.garage.tag}
        meta={[t.garage.approvedOnly, "Monad Testnet"]}
        partno="SKF-1"
        partnoSub={t.garage.partnoSub}
      />

      <main className="wrap pb-[clamp(48px,6vw,80px)] pt-[clamp(32px,5vw,56px)]">
        <div className="mx-auto max-w-[560px]">
          <h1 className="display text-[clamp(34px,4.4vw,54px)]">
            {t.garage.titleA} <em>{t.garage.titleB}</em>
          </h1>
          <p className="mb-10 mt-4 text-[16px] text-ink-2">{t.garage.intro}</p>

          <UstaSessionProvider>
            <EarningsCard />
            <ReportForm />
          </UstaSessionProvider>
        </div>
      </main>

      <PageFoot id={t.garage.tag} page={1} />
    </>
  );
}
