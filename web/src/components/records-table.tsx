import { ExternalLink } from "lucide-react";

import { explorerAddress } from "@/lib/chain";
import { recordType, TONE_TEXT, type VehicleRecord } from "@/lib/registry";
import type { Garage } from "@/lib/server";
import { cn, formatDate, formatKm, shortAddress } from "@/lib/utils";

import { Attachment } from "./attachment";
import { useLocale, useT } from "./preferences";

/**
 * Table 2: every record, in the order the car lived it.
 *
 * Numbered from the first inspection up, the way a datasheet numbers its pins:
 * a buyer reading "No. 4 · Kaza kaydı" can say which line they mean. Accident
 * rows carry the red wash a datasheet uses for the line under discussion.
 */
export function RecordsTable({
  records,
  garages,
}: {
  records: VehicleRecord[];
  garages: Map<string, Garage>;
}) {
  const t = useT();
  const locale = useLocale();
  const ordered = [...records].sort(
    (a, b) => a.serviceDay - b.serviceDay || Number(a.mileage) - Number(b.mileage),
  );

  return (
    <div className="tbl-wrap">
      <table className="ds">
        <caption>
          <span className="cap-n">{t.common.table} 2.</span> {t.records.table}
        </caption>
        <thead>
          <tr>
            <th className="w-12">{t.records.no}</th>
            <th>{t.records.date}</th>
            <th className="text-right">{t.records.km}</th>
            <th>{t.records.work}</th>
            <th>{t.records.garage}</th>
            <th>{t.records.notes}</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((record, index) => {
            const type = recordType(record.recordType);
            const garage = garages.get(record.reporter.toLowerCase());
            const accident = type.tone === "bad";

            return (
              <tr key={`${record.recordedAt}-${index}`} className={cn(accident && "hl")}>
                <td className="numeric text-ink-3">{index + 1}</td>
                <td className="whitespace-nowrap">
                  <time
                    dateTime={new Date(record.serviceDay * 86_400_000).toISOString()}
                    title={t.records.writtenOn(formatDate(record.recordedAt, locale))}
                  >
                    {formatDate(record.serviceDay * 86_400, locale)}
                  </time>
                </td>
                <td className="numeric whitespace-nowrap text-right text-ink">
                  {formatKm(record.mileage, locale)}
                </td>
                <td className={cn("whitespace-nowrap font-semibold", TONE_TEXT[type.tone])}>
                  {t.recordTypes[type.value]}
                </td>
                <td className="whitespace-nowrap">
                  <a
                    href={explorerAddress(record.reporter)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-ink underline decoration-hair underline-offset-4 transition hover:decoration-red"
                  >
                    {garage?.name ?? shortAddress(record.reporter)}
                    <ExternalLink className="size-3 text-ink-3" />
                  </a>
                </td>
                <td className="min-w-[180px]">
                  {record.note || <span className="text-ink-3">—</span>}
                  {record.ipfsCid && <Attachment cid={record.ipfsCid} compact />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
