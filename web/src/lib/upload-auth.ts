/*
 * Who may pin files to the registry's IPFS account: approved garages only.
 *
 * The upload route is the one place the app spends someone else's resources
 * (the Pinata account), so it has to know who is asking. The garage signs a
 * short message with its wallet - free, no transaction - and the server checks
 * both the signature and, on-chain, that the address is an approved garage.
 *
 * One signature covers an hour of uploads, so a garage attaching photos to
 * several records signs once, not once per photo.
 */

export const UPLOAD_PASS_SECONDS = 60 * 60;

/** Headers the form sends the pass in. */
export const UPLOAD_HEADERS = {
  address: "x-upload-address",
  expires: "x-upload-expires",
  signature: "x-upload-signature",
} as const;

/** The exact text the garage signs. Server and client must build it identically. */
export function uploadMessage(address: string, expires: number) {
  return [
    "CarLog",
    "IPFS belge yükleme izni / IPFS upload permission",
    `address: ${address.toLowerCase()}`,
    `expires: ${expires}`,
  ].join("\n");
}
