import { NextResponse } from "next/server";
import { isAddress, recoverMessageAddress } from "viem";

import type { UploadErrorCode } from "@/lib/i18n/dictionaries";
import { isApprovedGarage } from "@/lib/server";
import { UPLOAD_HEADERS, UPLOAD_PASS_SECONDS, uploadMessage } from "@/lib/upload-auth";

/**
 * Pins a photo or invoice to IPFS and hands the CID back to the client, which
 * then writes it into the record.
 *
 * The Pinata JWT stays on the server. Shipping it to the browser would put a
 * write credential in every visitor's devtools.
 */

/**
 * Pinata's V3 upload endpoint. It defaults to the *private* network, and a
 * private file does not resolve on a public gateway - the record's attachment
 * would open nothing. The whole point of an attachment on a public
 * registry is that a buyer can see it, so every upload goes out as public.
 *
 * The JWT needs the `org:files:write` scope.
 */
const PINATA_ENDPOINT = "https://uploads.pinata.cloud/v3/files";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

/**
 * Failures carry a code, not a sentence: the form shows them in the visitor's
 * language from its own dictionary. The codes are the keys of `upload` there.
 */
function fail(code: UploadErrorCode, status: number) {
  return NextResponse.json({ code }, { status });
}

/**
 * Only an approved garage may pin files: the request must carry a fresh
 * signature over `uploadMessage`, from an address the registry recognises.
 * See lib/upload-auth.ts.
 */
async function isAuthorized(request: Request) {
  const address = request.headers.get(UPLOAD_HEADERS.address) ?? "";
  const expires = Number(request.headers.get(UPLOAD_HEADERS.expires));
  const signature = request.headers.get(UPLOAD_HEADERS.signature) ?? "";

  if (!isAddress(address) || !/^0x[0-9a-fA-F]+$/.test(signature)) return false;

  const now = Math.floor(Date.now() / 1000);
  // Not expired, and not a pass minted to last longer than the form ever asks for.
  if (!Number.isInteger(expires) || expires <= now || expires > now + UPLOAD_PASS_SECONDS + 60) {
    return false;
  }

  try {
    const signer = await recoverMessageAddress({
      message: uploadMessage(address, expires),
      signature: signature as `0x${string}`,
    });
    if (signer.toLowerCase() !== address.toLowerCase()) return false;
    return await isApprovedGarage(signer);
  } catch (error) {
    console.error("upload auth check failed", error instanceof Error ? error.message : error);
    return false;
  }
}

export async function POST(request: Request) {
  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    console.error("upload refused: PINATA_JWT is not set");
    return fail("not_configured", 501);
  }

  if (!(await isAuthorized(request))) return fail("unauthorized", 401);

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value instanceof File) file = value;
  } catch {
    return fail("bad_request", 400);
  }

  if (!file) return fail("no_file", 400);
  if (file.size > MAX_BYTES) return fail("too_large", 413);
  if (file.type && !ALLOWED.includes(file.type)) return fail("bad_type", 415);

  const outbound = new FormData();
  outbound.append("file", file, file.name || "kayit");
  outbound.append("network", "public");
  outbound.append("name", `carlog/${Date.now()}-${file.name || "kayit"}`);

  const response = await fetch(PINATA_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: outbound,
  });

  if (!response.ok) {
    // Pinata's message can name the account; keep it server-side.
    console.error("pinata upload failed", response.status, await response.text());
    return fail("failed", 502);
  }

  const payload = (await response.json()) as { data?: { cid?: string } };
  const cid = payload.data?.cid;

  if (!cid) {
    console.error("pinata upload returned no cid", JSON.stringify(payload));
    return fail("failed", 502);
  }

  return NextResponse.json({ cid });
}
