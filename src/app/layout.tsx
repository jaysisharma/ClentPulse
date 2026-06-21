import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoading } from "@/components/page-loading";
import { AnalyticsTracker } from "@/components/analytics-tracker";

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
                  // Default to dark unless the user explicitly chose light.
                  var theme = localStorage.getItem('theme');
                  if (theme !== 'light') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors`}>
        <PageLoading />
        <ThemeProvider>
          <AnalyticsTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
