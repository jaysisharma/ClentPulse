import React from "react";
import Link from "next/link";
import { Wordmark as Logo } from "@/components/home/wordmark";
import { SAMPLE_PORTAL_URL, SIGNUP_URL, LOGIN_URL, SUPPORT_EMAIL } from "@/components/home/site";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
      { label: "Sample portal", href: SAMPLE_PORTAL_URL },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Start for free", href: SIGNUP_URL },
      { label: "Log in", href: LOGIN_URL },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: `mailto:${SUPPORT_EMAIL}` },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-background text-foreground py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          <div className="col-span-2 lg:col-span-5 space-y-3">
            <Logo className="text-lg" />
            <p className="text-sm text-muted-foreground max-w-xs">
              One private portal for every client: progress, approvals, contracts and payments.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2 space-y-3 text-sm">
              <p className="font-semibold">{col.title}</p>
              <ul className="space-y-2 text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href} className="hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; 2026 Frevio. All rights reserved.</p>
          <p>Built for freelancers, studios and small agencies.</p>
        </div>
      </div>
    </footer>
  );
}
