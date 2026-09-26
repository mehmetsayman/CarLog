/** Cookie names and values shared by the server and the toggles. */

export const LOCALE_COOKIE = "lang";
export const THEME_COOKIE = "theme";

export type Theme = "light" | "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** A year, on every path, readable by the server on the next request. */
export function writePreference(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

/** Switch the sheet's colours now, without waiting for a server round trip. */
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}
