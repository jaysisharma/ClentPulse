import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoading } from "@/components/page-loading";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frevio — Weekly Project Updates for Freelancers",
  description: "Send beautiful weekly project updates to clients with one click. Stop writing status emails manually.",
  keywords: [
    "freelancer client portal",
    "project tracking for agencies",
    "client collaboration dashboard",
    "freelance invoicing software",
    "freelance time tracking",
    "shareable contracts and proposals",
    "client feedback portal"
  ],
  authors: [{ name: "Frevio Team", url: "https://frevio.cloud" }],
  metadataBase: new URL("https://frevio.cloud"),
  openGraph: {
    title: "Frevio — Weekly Project Updates for Freelancers",
    description: "Send beautiful weekly project updates to clients with one click. Stop writing status emails manually.",
    url: "https://frevio.cloud",
    siteName: "Frevio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Frevio Logo"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Frevio — Weekly Project Updates for Freelancers",
    description: "Send beautiful weekly project updates to clients with one click. Stop writing status emails manually.",
    images: ["/logo.svg"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  console.log('[Init Script] Starting...');
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  console.log('[Init Script] Stored theme:', theme);
                  console.log('[Init Script] Prefers dark:', prefersDark);

                  const isDark = theme === 'dark' || (!theme && prefersDark);
                  console.log('[Init Script] Should be dark:', isDark);

                  if (isDark) {
                    console.log('[Init Script] Adding dark class');
                    document.documentElement.classList.add('dark');
                  } else {
                    console.log('[Init Script] Removing dark class');
                    document.documentElement.classList.remove('dark');
                  }
                  console.log('[Init Script] Final classes:', document.documentElement.className);
                } catch (e) {
                  console.error('[Init Script] Error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors`}>
        <PageLoading />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
