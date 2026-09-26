import "server-only";

import { createPublicClient, http } from "viem";

import { cached } from "./cache";
import { monadTestnet } from "./chain";
import {
  normalizeVin,
  registry,
  vinToTokenId,
  type VehicleSummary,
} from "./registry";

/**
 * The buyer panel reads the chain on the server. A used-car buyer standing in a
 * lot has no wallet and no reason to install one - asking them to connect before
 * they can see a history would defeat the point of a public registry.
 */
const publicClient = createPublicClient({
  chain: monadTestnet,
  // The public RPC allows 15 requests a second. Multicall folds each Promise.all
  // below into a single eth_call, the cache in ./cache absorbs repeat visits,
  // and the retries (0.3s, 0.6s, 1.2s, 2.4s) ride out a burst.
  batch: { multicall: { wait: 16 } },
  // MONAD_RPC_URL, if set, points the server at a private endpoint with a higher
  // limit. It stays server-side: browsers keep using the public RPC per visitor.
  transport: http(process.env.MONAD_RPC_URL || undefined, { retryCount: 4, retryDelay: 300 }),
});

/** How long a vehicle's public preview is reused before the chain is asked again. */
const PREVIEW_TTL_MS = 10_000;
/** Price and split change only when the owner changes them. */
const TERMS_TTL_MS = 60_000;

export type Garage = {
  address: `0x${string}`;
  name: string;
  recordCount: number;
  active: boolean;
};

/**
 * The free preview. Everything here is what the paywall lets anyone see, so it is
 * safe to render on the server and ship to the browser.
 *
 * The gated half - dates, notes, which garage wrote what, attachments - is
 * deliberately NOT loaded here. Fetching it server-side and hiding it with CSS
 * would put the whole report in the page source.
 */
export type VehiclePreview = {
  vin: string;
  tokenId: bigint;
  summary: VehicleSummary;
  /** Report price in wei, as a string so it survives the server boundary. */
  priceWei: string;
  /** How many garages would share this sale. A count, never the addresses -
   *  who worked on the car is part of what the report sells. */
  garageCount: number;
  /** The garages' combined share, in basis points. */
  garageShareBps: number;
};

/** The registry's current terms: what a report costs and how a sale is split. */
function loadTerms() {
  return cached("terms", TERMS_TTL_MS, async () => {
    const [price, platformShareBps] = await Promise.all([
      publicClient.readContract({ ...registry, functionName: "reportPrice" }) as Promise<bigint>,
      publicClient.readContract({
        ...registry,
        functionName: "platformShareBps",
      }) as Promise<number>,
    ]);
    return { priceWei: price.toString(), platformShareBps: Number(platformShareBps) };
  });
}

export async function loadVehiclePreview(rawVin: string): Promise<VehiclePreview | null> {
  const vin = normalizeVin(rawVin);
  if (vin.length !== 17) return null;

  const tokenId = vinToTokenId(vin);

  const [vehicle, terms] = await Promise.all([
    cached(`vehicle:${vin}`, PREVIEW_TTL_MS, async () => {
      const [summary, split] = await Promise.all([
        publicClient.readContract({
          ...registry,
          functionName: "getVehicleSummary",
          args: [tokenId],
        }) as Promise<VehicleSummary>,
        publicClient.readContract({
          ...registry,
          functionName: "reportSplit",
          args: [tokenId],
        }) as Promise<readonly [readonly string[], readonly bigint[]]>,
      ]);
      // The split always ends with the platform, so the rest are garages.
      return { summary, garageCount: Math.max(split[0].length - 1, 0) };
    }),
    loadTerms(),
  ]);

  if (!vehicle.summary.registered) return null;

  return {
    vin,
    tokenId,
    summary: vehicle.summary,
    priceWei: terms.priceWei,
    garageCount: vehicle.garageCount,
    garageShareBps: 10_000 - terms.platformShareBps,
  };
}

/** The report price, for the landing page's table. Null when the RPC is unreachable. */
export async function loadReportPrice(): Promise<string | null> {
  try {
    return (await loadTerms()).priceWei;
  } catch (error) {
    console.error("registry terms unavailable", error instanceof Error ? error.message : error);
    return null;
  }
}

/** Whether an address may write to the registry - and so may upload evidence. */
export function isApprovedGarage(address: `0x${string}`) {
  return cached(`garage:${address.toLowerCase()}`, 60_000, async () =>
    Boolean(
      await publicClient.readContract({
        ...registry,
        functionName: "isServiceProvider",
        args: [address],
      }),
    ),
  );
}

/**
 * Whether `signature` is `address` signing `message`. Works for plain wallets and
 * for smart accounts (ERC-1271, and ERC-6492 before the account is deployed),
 * which is how a garage signed in by phone signs.
 */
export async function verifyAddressSignature(
  address: `0x${string}`,
  message: string,
  signature: `0x${string}`,
) {
  return publicClient.verifyMessage({ address, message, signature });
}
