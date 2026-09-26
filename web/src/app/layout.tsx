import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";

import { PreferencesProvider } from "@/components/preferences";
import { Providers } from "@/components/providers";
import { getDictionary, getTheme } from "@/lib/i18n/server";

import "./globals.css";

/*
 * Archivo is loaded as a variable font with its width axis, because the whole
 * datasheet voice lives on that axis: condensed and heavy for headlines, normal
 * width for body text. A fixed-width cut would lose half the typography.
 */
const sans = Archivo({
  variable: "--font-sans-face",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin", "latin-ext"],
});

/**
 * The public address, so shared links get absolute image URLs. Set
 * NEXT_PUBLIC_SITE_URL on the host; on Vercel the production domain is used.
 */
function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  return {
    metadataBase: new URL(siteUrl()),
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: "CarLog",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getDictionary();
  const theme = await getTheme();

  return (
    <html
      lang={locale}
      // No attribute until the visitor chooses: the CSS then follows the system.
      data-theme={theme ?? undefined}
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
      // The theme toggle writes data-theme before React knows about it.
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <PreferencesProvider locale={locale} theme={theme}>
          <Providers>{children}</Providers>
        </PreferencesProvider>
      </body>
    </html>
  );
}
