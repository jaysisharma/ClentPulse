import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoading } from "@/components/page-loading";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { AuthHashHandler } from "@/components/auth-hash-handler";

const inter = Inter({ subsets: ["latin"] });
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: {
    default: "Frevio — Client Portal & Operating System for Freelancers & Studios",
    template: "%s | Frevio",
  },
  description: "The modern client operating system. Automate weekly status updates, streamline milestone approvals, and settle invoices with zero fees via Stripe.",
  keywords: [
    "freelancer client portal",
    "client operating system",
    "agency dashboard",
    "client collaboration portal",
    "weekly project updates",
    "freelance milestone approvals",
    "freelance invoicing software",
    "freelance time tracking",
    "shareable contracts and proposals",
    "client feedback portal",
    "Frevio"
  ],
  authors: [{ name: "Frevio Team", url: "https://frevio.cloud" }],
  creator: "Frevio",
  publisher: "Frevio",
  metadataBase: new URL("https://frevio.cloud"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Frevio — Client Portal & Operating System for Freelancers & Studios",
    description: "One unified link for weekly updates, milestone approvals, contracts, and zero-fee Stripe settlements.",
    url: "https://frevio.cloud",
    siteName: "Frevio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Frevio — Client Portal and Operating System",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Frevio — Client Portal & Operating System for Freelancers & Studios",
    description: "One unified link for weekly updates, milestone approvals, contracts, and zero-fee Stripe settlements.",
    images: ["/og-image.png"],
    creator: "@frevioapp",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Frevio",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://frevio.cloud/#organization",
      "name": "Frevio",
      "url": "https://frevio.cloud",
      "logo": "https://frevio.cloud/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://frevio.cloud/#website",
      "url": "https://frevio.cloud",
      "name": "Frevio",
      "publisher": { "@id": "https://frevio.cloud/#organization" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://frevio.cloud/#software",
      "name": "Frevio",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "url": "https://frevio.cloud",
      "description": "Client operating system and portal for modern freelancers and boutique agencies. Milestone approvals, client dashboards, and zero-fee Stripe invoice settlements.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
      <body className={`${inter.className} ${caveat.variable} min-h-full antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors`}>
        <PageLoading />
        <ThemeProvider>
          <AnalyticsTracker />
          <AuthHashHandler />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
