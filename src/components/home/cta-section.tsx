import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { SAMPLE_PORTAL_URL, SIGNUP_URL } from "@/components/home/site";

export default function CTASection() {
  return (
    <section className="w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto rounded-2xl bg-accent text-white px-6 py-14 sm:px-14 sm:py-20 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            Give your next client a better way to work with you.
          </h2>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8">
            Set up your first project and portal in a few minutes. Your client gets one link, and you stop chasing
            updates, approvals and payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href={SIGNUP_URL}
              className="px-5 py-2.5 rounded-md bg-white text-accent font-semibold text-base text-center hover:bg-white/90 transition-colors"
            >
              Start for free
            </a>
            <Link
              href={SAMPLE_PORTAL_URL}
              className="px-5 py-2.5 rounded-md border border-white/40 text-white font-medium text-base text-center hover:bg-white/10 transition-colors"
            >
              See a client portal
            </Link>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            {["No credit card required", "Free for up to 2 projects", "Clients never need an account"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="w-4 h-4" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
