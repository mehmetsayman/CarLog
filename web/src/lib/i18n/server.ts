import "server-only";

import { cookies } from "next/headers";

import { DEFAULT_LOCALE, dictionaries, isLocale, type Locale } from "./dictionaries";
import { isTheme, THEME_COOKIE, LOCALE_COOKIE, type Theme } from "./preferences";

/** The visitor's language, from the cookie the toggle sets. Turkish until chosen. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

/**
 * The theme the visitor picked, or null if they never did - in which case the
 * page follows the system setting through CSS alone.
 */
export async function getTheme(): Promise<Theme | null> {
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return isTheme(value) ? value : null;
}
