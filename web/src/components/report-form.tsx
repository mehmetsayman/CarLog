"use client";

import { ArrowRight, Check, FilePlus2, Loader2, Paperclip, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useReadContract,
  useSignMessage,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { explorerTx, monadTestnet } from "@/lib/chain";
import {
  dateToServiceDay,
  isCompleteVin,
  normalizeVin,
  RECORD_TYPES,
  registry,
  type VehicleSummary,
} from "@/lib/registry";
import { isUploadErrorCode } from "@/lib/i18n/dictionaries";
import { UPLOAD_HEADERS, UPLOAD_PASS_SECONDS, uploadMessage } from "@/lib/upload-auth";
import { cn, formatKm } from "@/lib/utils";

import { SectionHeading } from "./section-heading";
import { useLocale, useT } from "./preferences";
import { WalletButton } from "./wallet-button";

export function ReportForm() {
  const t = useT();
  const locale = useLocale();
  const { address, isConnected, chainId } = useAccount();

  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [typeValue, setTypeValue] = useState<number>(0);
  const [note, setNote] = useState("");

  /**
   * The day the work was done, which is not always today: a garage may be
   * entering last week's job. Defaults to today and cannot be in the future.
   */
  const todayIso = new Date().toISOString().slice(0, 10);
  const [servicedOn, setServicedOn] = useState(todayIso);

  /**
   * Only used when opening a file for a vehicle the registry has never seen.
   * Empty means the token stays with the garage until the owner claims it,
   * which is what the contract does for the zero address.
   */
  const [vehicleOwner, setVehicleOwner] = useState("");

  /** IPFS attachment: the photo or invoice backing this record. */
  const [attachment, setAttachment] = useState<{ name: string; cid: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [signing, setSigning] = useState(false);
  /** The signed upload permission, reused for an hour. See lib/upload-auth.ts. */
  const uploadPass = useRef<{ address: string; expires: number; signature: string } | null>(
    null,
  );
  const { signMessageAsync } = useSignMessage();
  /** A code from the upload route, or "failed"; shown through the dictionary. */
  const [uploadError, setUploadError] = useState<keyof typeof t.upload | null>(null);

  /** Milliseconds between the signature landing and the receipt arriving. */
  const [confirmMs, setConfirmMs] = useState<number | null>(null);
  const sentAt = useRef<number | null>(null);

  const onRightNetwork = isConnected && chainId === monadTestnet.id;

  // Is this wallet allowed to write history at all?
  const { data: isService, isLoading: checkingService } = useReadContract({
    ...registry,
    functionName: "isServiceProvider",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && onRightNetwork },
  });

  // What the chain already knows about this VIN, refreshed as they type.
  const { data: summary, refetch: refetchSummary } = useReadContract({
    ...registry,
    functionName: "getVehicleSummaryByVin",
    args: [vin],
    query: { enabled: isCompleteVin(vin) && onRightNetwork },
  }) as { data: VehicleSummary | undefined; refetch: () => void };

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Time the network, not the human: start the clock once the wallet has signed.
  useEffect(() => {
    if (hash && sentAt.current === null) sentAt.current = Date.now();
  }, [hash]);

  useEffect(() => {
    if (isSuccess && sentAt.current !== null) {
      setConfirmMs(Date.now() - sentAt.current);
      sentAt.current = null;
      refetchSummary();
    }
  }, [isSuccess, refetchSummary]);

  const mileageNumber = mileage === "" ? null : Number(mileage);
  const recordedKm = summary?.registered ? Number(summary.lastMileage) : null;

  /**
   * A VIN the chain has never seen is not an error - it is the other half of the
   * garage's job. The first shop to touch a car opens its file.
   */
  const registering = Boolean(summary) && summary?.registered === false;

  /**
   * The contract would reject a rollback anyway. Catching it here means the
   * garage sees why before paying for a signature, not after.
   */
  const rollback =
    recordedKm !== null && mileageNumber !== null && mileageNumber < recordedKm;

  const problem = useMemo(() => {
    const problems = t.form.problems;
    if (!isCompleteVin(vin)) return problems.vinLength;
    if (mileageNumber === null || Number.isNaN(mileageNumber)) return problems.enterKm;
    if (mileageNumber <= 0) return problems.kmPositive;
    if (rollback) return problems.rollback(formatKm(recordedKm!, locale));
    if (!servicedOn) return problems.enterDate;
    if (servicedOn > todayIso) return problems.futureDate;
    if (registering && vehicleOwner.trim() && !/^0x[0-9a-fA-F]{40}$/.test(vehicleOwner.trim())) {
      return problems.badOwner;
    }
    return null;
  }, [
    t,
    locale,
    vin,
    mileageNumber,
    rollback,
    recordedKm,
    servicedOn,
    todayIso,
    registering,
    vehicleOwner,
  ]);

  const canSubmit =
    onRightNetwork &&
    isService === true &&
    !problem &&
    !uploading &&
    !isPending &&
    !isConfirming;

  /** A signature proving this wallet may upload; asks for one only when needed. */
  async function getUploadPass() {
    const now = Math.floor(Date.now() / 1000);
    const pass = uploadPass.current;
    if (pass && pass.address === address && pass.expires - now > 5 * 60) return pass;

    const expires = now + UPLOAD_PASS_SECONDS;
    setSigning(true);
    try {
      const signature = await signMessageAsync({ message: uploadMessage(address!, expires) });
      uploadPass.current = { address: address!, expires, signature };
      return uploadPass.current;
    } finally {
      setSigning(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      let pass;
      try {
        pass = await getUploadPass();
      } catch {
        setUploadError("signature_rejected");
        return;
      }

      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body,
        headers: {
          [UPLOAD_HEADERS.address]: pass.address,
          [UPLOAD_HEADERS.expires]: String(pass.expires),
          [UPLOAD_HEADERS.signature]: pass.signature,
        },
      });
      const payload = (await response.json()) as { cid?: string; code?: string };

      if (!response.ok || !payload.cid) {
        // A pass the server refused will not get better by reusing it.
        if (response.status === 401) uploadPass.current = null;
        setUploadError(isUploadErrorCode(payload.code) ? payload.code : "failed");
        return;
      }
      setAttachment({ name: file.name, cid: payload.cid });
    } catch {
      setUploadError("failed");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    if (!canSubmit) return;
    setConfirmMs(null);
    sentAt.current = null;
    const day = dateToServiceDay(new Date(servicedOn));

    if (registering) {
      writeContract({
        ...registry,
        functionName: "registerVehicle",
        args: [
          normalizeVin(vin),
          mileageNumber!,
          day,
          // Zero address keeps the token at the garage until the owner claims it.
          (vehicleOwner.trim() || "0x0000000000000000000000000000000000000000") as `0x${string}`,
          attachment?.cid ?? "",
          note.trim() || t.form.firstEntryNote,
        ],
      });
      return;
    }

    writeContract({
      ...registry,
      functionName: "addRecordByVin",
      args: [
        normalizeVin(vin),
        mileageNumber!,
        day,
        typeValue,
        attachment?.cid ?? "",
        note.trim(),
      ],
    });
  }

  function startOver() {
    reset();
    setConfirmMs(null);
    setMileage("");
    setNote("");
    setServicedOn(todayIso);
    setVehicleOwner("");
    setAttachment(null);
    setUploadError(null);
  }

  // --- states that replace the whole form -----------------------------------

  if (!isConnected || !onRightNetwork) {
    return (
      <Notice label={t.form.connectLabel} title={t.form.connectTitle} body={t.form.connectBody}>
        <WalletButton className="w-full sm:w-auto" />
      </Notice>
    );
  }

  if (checkingService) {
    return (
      <Notice
        label={t.form.checkingLabel}
        title={t.form.checkingTitle}
        body={t.form.checkingBody}
        icon={<Loader2 className="size-5 animate-spin text-red" />}
      />
    );
  }

  if (isService !== true) {
    return (
      <Notice
        label={t.form.refusedLabel}
        tone="alert"
        title={t.form.refusedTitle}
        body={t.form.refusedBody}
      >
        <code className="numeric block break-all border-[1.5px] border-ink bg-paper-2 px-3 py-2 text-[13px] text-ink">
          {address}
        </code>
      </Notice>
    );
  }

  if (isSuccess) {
    return (
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center bg-green text-paper">
            <Check className="size-4" strokeWidth={3} />
          </span>
          <span className="label text-green">{t.form.confirmed}</span>
        </div>
        <h2 className="display mt-4 text-[clamp(30px,8vw,44px)]">
          {registering ? (
            <>
              {t.form.registeredA} <em>{t.form.registeredB}</em>
            </>
          ) : (
            <>
              {t.form.writtenA} <em>{t.form.writtenB}</em>
            </>
          )}
        </h2>
        <p className="mt-3 text-[15px] text-ink-2">{t.form.permanent}</p>

        <div className="tbl-wrap mt-7">
          <table className="ds">
            <caption>
              <span className="cap-n">{t.common.table} 1.</span> {t.form.resultTable}
            </caption>
            <tbody>
              <tr>
                <td>{t.form.status}</td>
                <td className="numeric font-semibold text-green">{t.form.statusConfirmed}</td>
              </tr>
              {confirmMs !== null && (
                <tr className="hl">
                  <td>{t.form.confirmTime}</td>
                  <td className="numeric font-semibold text-ink">{confirmMs} ms</td>
                </tr>
              )}
              <tr>
                <td>{t.form.vin}</td>
                <td className="numeric break-all text-ink">{normalizeVin(vin)}</td>
              </tr>
              {hash && (
                <tr>
                  <td>{t.form.tx}</td>
                  <td>
                    <a
                      href={explorerTx(hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="numeric text-ink underline decoration-hair underline-offset-4 hover:decoration-red"
                    >
                      {hash.slice(0, 10)}…{hash.slice(-6)}
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={startOver} className="btn btn-ghost mt-7 w-full">
          {t.form.newRecord}
        </button>
      </div>
    );
  }

  // --- the form -------------------------------------------------------------

  return (
    <div className="space-y-10">
      {/* 1. The vehicle */}
      <section>
        <SectionHeading n={1}>{t.form.sectionVehicle}</SectionHeading>
        <Field label={t.form.vinField} hint={`${vin.length}/17`}>
          <input
            value={vin}
            onChange={(e) => setVin(normalizeVin(e.target.value).slice(0, 17))}
            placeholder="WVWZZZ1JZXW000001"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="numeric text-[17px] tracking-[0.05em]"
          />
        </Field>

        {summary?.registered && (
          <p className="mt-3 flex items-start gap-2 text-[14px] text-ink-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green" strokeWidth={2} />
            <span>
              {t.form.registeredLine(
                formatKm(summary.lastMileage, locale),
                Number(summary.recordCount),
              )}
            </span>
          </p>
        )}

        {registering && (
          <div className="mt-3 border-l-[3px] border-red bg-red-wash px-4 py-3">
            <p className="flex items-center gap-2 text-[14px] font-bold text-ink">
              <FilePlus2 className="size-4 shrink-0 text-red" strokeWidth={2} />
              {t.form.newVehicle}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
              {t.form.newVehicleBody}
            </p>
          </div>
        )}
      </section>

      {/* 2. The work */}
      <section>
        <SectionHeading n={2}>{t.form.sectionWork}</SectionHeading>
        <div className="space-y-5">
          <Field label={t.form.mileage} hint="km" error={rollback}>
            <input
              value={mileage}
              onChange={(e) => setMileage(e.target.value.replace(/\D/g, "").slice(0, 7))}
              placeholder={recordedKm !== null ? formatKm(recordedKm, locale) : "0"}
              inputMode="numeric"
              className={cn("numeric text-[17px]", rollback && "text-red")}
            />
          </Field>

          <Field label={t.form.serviceDate}>
            <input
              type="date"
              value={servicedOn}
              max={todayIso}
              onChange={(e) => setServicedOn(e.target.value)}
              className="numeric text-[15px]"
            />
          </Field>

          {registering ? (
            <Field label={t.form.owner}>
              <input
                value={vehicleOwner}
                onChange={(e) => setVehicleOwner(e.target.value.trim())}
                placeholder={t.form.ownerPlaceholder}
                autoCorrect="off"
                spellCheck={false}
                className="numeric text-[14px]"
              />
            </Field>
          ) : (
            <fieldset>
              <legend className="label mb-2">{t.form.workType}</legend>
              <div className="grid grid-cols-2 border-l-[1.5px] border-t-[1.5px] border-ink">
                {RECORD_TYPES.map((type) => {
                  const selected = typeValue === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setTypeValue(type.value)}
                      className={cn(
                        "border-b-[1.5px] border-r-[1.5px] border-ink px-3 py-3 text-left text-[14px] transition",
                        selected
                          ? "bg-ink font-semibold text-paper"
                          : "bg-paper text-ink-2 hover:bg-paper-2",
                      )}
                    >
                      {t.recordTypes[type.value]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <Field label={t.form.note}>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 120))}
              placeholder={t.form.notePlaceholder}
              className="text-[15px]"
            />
          </Field>
        </div>
      </section>

      {/* 3. The evidence */}
      <section>
        <SectionHeading n={3}>{t.form.sectionEvidence}</SectionHeading>
        {attachment ? (
          <div className="flex items-center gap-3 border-[1.5px] border-green px-4 py-3">
            <Paperclip className="size-4 shrink-0 text-green" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">{attachment.name}</p>
              <p className="numeric truncate text-[12px] text-ink-3">{attachment.cid}</p>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label={t.form.removeAttachment}
              className="p-1.5 text-ink-3 transition hover:bg-ink hover:text-paper"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 border-[1.5px] border-dashed border-ink px-4 py-3.5 text-[14px] text-ink-2 transition hover:bg-paper-2",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-red" />
            ) : (
              <Paperclip className="size-4 shrink-0 text-red" strokeWidth={2} />
            )}
            {signing ? t.form.signing : uploading ? t.form.uploading : t.form.pickFile}
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
        {uploadError && (
          <p className="mt-2 text-[13px] text-amber">
            {t.upload[uploadError]} {t.form.uploadFallback}
          </p>
        )}
      </section>

      {/* Submit */}
      <div className="border-t-[1.5px] border-ink pt-6">
        {writeError && (
          <p className="mb-4 border-l-[3px] border-red bg-red-wash px-4 py-3 text-[14px] font-semibold text-red-ink">
            {writeError.message.includes("MileageRollback")
              ? t.form.rollbackRejected
              : writeError.message.split("\n")[0]}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="btn w-full py-[18px] text-[16px]"
        >
          {isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {t.common.confirmInWallet}
            </>
          ) : isConfirming ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {t.form.sent}
            </>
          ) : (
            <>
              {registering ? t.form.registerVehicle : t.form.submitRecord}
              <ArrowRight className="size-5" strokeWidth={2} />
            </>
          )}
        </button>

        {problem && !isPending && !isConfirming && (
          <p
            className={cn(
              "mt-3 text-center text-[13px]",
              rollback ? "font-semibold text-red" : "text-ink-3",
            )}
          >
            {problem}
          </p>
        )}
      </div>
    </div>
  );
}

// --- small building blocks ---------------------------------------------------

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      <div className="field" data-error={error ? "true" : undefined}>
        {children}
        {hint && <span className="numeric shrink-0 text-[12px] text-ink-3">{hint}</span>}
      </div>
    </label>
  );
}

/** A state that replaces the form: not connected, checking, or refused. */
function Notice({
  label,
  title,
  body,
  icon,
  tone = "default",
  children,
}: {
  label: string;
  title: string;
  body: string;
  icon?: React.ReactNode;
  tone?: "default" | "alert";
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("border-[1.5px] p-6", tone === "alert" ? "border-red" : "border-ink")}>
      <div className="flex items-center gap-2.5">
        {icon}
        <span className={cn("label", tone === "alert" && "text-red")}>{label}</span>
      </div>
      <h2 className="display mt-3 text-[clamp(28px,7vw,38px)]">{title}</h2>
      <p className="mt-3 text-[15px] text-ink-2">{body}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
