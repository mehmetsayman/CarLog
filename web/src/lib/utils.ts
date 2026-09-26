import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { INTL_LOCALE, type Locale } from "./i18n/dictionaries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 88100 -> "88.100" in Turkish, "88,100" in English. */
export function formatKm(value: number | bigint, locale: Locale = "tr") {
  return Number(value).toLocaleString(INTL_LOCALE[locale]);
}

/** 0x1c6ecefd...db944 -> "0x1c6e...b944" */
export function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number | bigint, locale: Locale = "tr") {
  return new Date(Number(timestamp) * 1000).toLocaleDateString(INTL_LOCALE[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
