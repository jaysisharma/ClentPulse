"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { Wordmark as Logo } from "@/components/home/wordmark";
import { LOGIN_URL, SIGNUP_URL } from "@/components/home/site";

const navItems = [
  { name: "How it works", href: "#how-it-works" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
];

export default function SiteHeader({
  isLoggedIn = false,
  promoRemaining = null,
  launchPlatform = null,
}: {
  isLoggedIn?: boolean;
  promoRemaining?: number | null;
  launchPlatform?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const hasPromo = promoRemaining !== null && promoRemaining > 0;

  return (
    <>
      {/* Launch promo is granted automatically at signup */}
      {!isLoggedIn && (launchPlatform || hasPromo) && (
        <div className="bg-accent text-white text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-center">
            <span>
              {launchPlatform && <strong className="font-semibold">Welcome, {launchPlatform} 👋 </strong>}
              {hasPromo ? (
                <>
                  The first 50 signups get <strong className="font-semibold">1 month of Frevio Pro free</strong>. No
                  code needed · {promoRemaining} left
                </>
              ) : (
                <>Free for your first 2 projects. No card needed.</>
              )}
            </span>
            <a href={SIGNUP_URL} className="inline-flex items-center gap-0.5 font-medium underline underline-offset-4">
              Claim <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
        <Link href="/" aria-label="Frevio home">
          <Logo className="text-base" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn ? (
            <a
              href="/dashboard"
              className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              Dashboard
            </a>
          ) : (
          <>
          <a
            href={LOGIN_URL}
            className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium rounded-md text-foreground hover:bg-muted transition-colors"
          >
            Log in
          </a>
          <a
            href={SIGNUP_URL}
            className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            Start for free
          </a>
          </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-background px-4 pb-4">
          <ul className="flex flex-col py-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm text-foreground"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={LOGIN_URL}
              className="text-center px-3 py-2 text-sm font-medium rounded-md border border-border text-foreground"
            >
              Log in
            </a>
            <a
              href={SIGNUP_URL}
              className="text-center px-3 py-2 text-sm font-medium rounded-md bg-accent text-white"
            >
              Start for free
            </a>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
