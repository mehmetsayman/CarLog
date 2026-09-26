"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { dictionaries, LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import {
  applyTheme,
  LOCALE_COOKIE,
  THEME_COOKIE,
  writePreference,
  type Theme,
} from "@/lib/i18n/preferences";
import { cn } from "@/lib/utils";

/*
 * Language and theme, as the visitor chose them.
 *
 * Both live in cookies so the server renders the right language and the right
 * colours on the first byte - no flash of Turkish before English, or of white
 * before dark. The server reads them in the root layout and hands them down here.
 */

type Preferences = { locale: Locale; theme: Theme | null };

const PreferencesContext = createContext<Preferences>({ locale: "tr", theme: null });

export function PreferencesProvider({
  locale,
  theme,
  children,
}: Preferences & { children: ReactNode }) {
  return (
    <PreferencesContext.Provider value={{ locale, theme }}>{children}</PreferencesContext.Provider>
  );
}

export function useLocale() {
  return useContext(PreferencesContext).locale;
}

/** The dictionary for the current language. */
export function useT() {
  return dictionaries[useLocale()];
}

/** TR | EN, set into the red band. */
export function LanguageToggle() {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();

  function choose(next: Locale) {
    if (next === locale) return;
    writePreference(LOCALE_COOKIE, next);
    // Server components re-render with the new cookie, the root layout sets the
    // new `lang`, and client components follow the provider it re-renders.
    router.refresh();
  }

  return (
    <div
      role="group"
      aria-label={t.prefs.language}
      className="flex shrink-0 border-[1.5px] border-white text-[12.5px] font-bold tracking-[0.06em]"
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={option === locale}
          onClick={() => choose(option)}
          className={cn(
            "px-2 py-[5px] uppercase transition",
            option === locale ? "bg-white text-brand" : "text-white hover:bg-white/15",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Sun or moon: shows the theme you would switch to. */
export function ThemeToggle() {
  const t = useT();
  const saved = useContext(PreferencesContext).theme;
  const [chosen, setChosen] = useState<Theme | null>(saved);

  // With no saved choice the page follows the system, so the button has to too.
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );

  const current: Theme = chosen ?? (systemDark ? "dark" : "light");
  const next: Theme = current === "dark" ? "light" : "dark";

  function toggle() {
    applyTheme(next);
    writePreference(THEME_COOKIE, next);
    setChosen(next);
  }

  const label = next === "dark" ? t.prefs.toDark : t.prefs.toLight;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex size-[31px] shrink-0 items-center justify-center border-[1.5px] border-white text-white transition hover:bg-white hover:text-brand"
    >
      {current === "dark" ? (
        <Sun className="size-4" strokeWidth={2} />
      ) : (
        <Moon className="size-4" strokeWidth={2} />
      )}
    </button>
  );
}
