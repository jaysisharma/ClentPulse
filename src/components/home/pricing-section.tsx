"use client";

import React, { useState } from "react";
import { SIGNUP_URL, SUPPORT_EMAIL } from "@/components/home/site";
import SectionHeader from "@/components/home/section-header";
import { motion, type Variants } from "motion/react";
import {
  Check,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Headphones,
  Crown,
} from "lucide-react";


const cardStagger: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.65,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "FREE",
      priceMonthly: 0,
      priceYearly: 0,
      tagline: "For your first clients.",
      isPopular: false,
      ctaText: "Get started",
      ctaVariant: "outline",
      features: [
        "Up to 2 active projects",
        "Client portal & status page",
        "Updates, milestones & approvals",
        "Proposals & contracts",
        "Invoicing with Stripe payments",
        "Time tracking",
      ],
    },
    {
      name: "PRO",
      priceMonthly: 19,
      priceYearly: 16,
      tagline: "For full-time freelancers.",
      isPopular: true,
      ctaText: "Choose Pro",
      ctaVariant: "primary",
      features: [
        "Everything in Free",
        "Unlimited active projects",
        "Automatic client update emails",
        "Your logo & accent color",
        "Remove \u201cPowered by Frevio\u201d",
        "Expense & profit analytics",
      ],
    },
    {
      name: "AGENCY",
      priceMonthly: 49,
      priceYearly: 41,
      tagline: "For studios and small teams.",
      isPopular: false,
      ctaText: "Choose Agency",
      ctaVariant: "outline",
      features: [
        "Everything in Pro",
        "Up to 5 team members",
        "Owner, PM & Member roles",
        "Team pods on client portals",
        "Internal notes & PM review",
        "Activity & audit log",
      ],
    },
  ];

  return (
    <section id="pricing" className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background text-foreground overflow-hidden border-b border-border">
      <div className="max-w-7xl mx-auto relative z-10">
        
        <SectionHeader
          kicker="Pricing"
          title="Simple pricing that grows with you."
          intro="Start free with your first clients. Add your brand, your team and your own domain when you need them."
        >
          {/* Billing Switcher Toggle */}
          <div className="mt-8 inline-flex items-center">
            <div className="p-1 rounded-md bg-card border border-border flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  !isYearly
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isYearly
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Yearly</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isYearly
                      ? "bg-white/20 text-white border-white/30"
                      : "bg-accent/10 text-brand border-accent/30"
                  }`}
                >
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </SectionHeader>

        {/* ── 3 PRICING CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-8">
          {plans.map((plan, index) => {
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;

            return (
              <motion.div
                key={plan.name}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={cardStagger}
                className={`rounded-md p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.isPopular
                    ? "border-2 border-accent bg-card shadow-[0_0_50px_rgba(79,70,229,0.2)] lg:-translate-y-2"
                    : "border border-border bg-card hover:border-foreground/20 shadow-xl"
                }`}
              >
                <div>
                  {/* Top Row: Plan Name & Most Popular Badge */}
                  <div className="flex items-center justify-between mb-3 min-h-[28px]">
                    <span className="text-xs font-mono font-bold tracking-wider text-brand">
                      {plan.name}
                    </span>
                    {plan.isPopular && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-accent/15 text-brand border border-accent/40 flex items-center gap-1 shadow-sm">
                        <Crown className="w-3 h-3 text-brand" />
                        <span>Most popular</span>
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-sans">
                      ${price}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {isYearly && price > 0 ? "/mo, billed yearly" : "/month"}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-muted-foreground pb-5 mb-5 border-b border-border">
                    {plan.tagline}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 text-xs sm:text-[13px] text-foreground/80">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full border border-accent/40 bg-accent/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span className="leading-snug text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA Button */}
                <div className="pt-8">
                  {plan.isPopular ? (
                    <a href={SIGNUP_URL} className="w-full py-2.5 px-4 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-sm shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 flex items-center justify-center gap-1.5">
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a href={SIGNUP_URL} className="w-full py-2.5 px-4 rounded-md border border-border hover:bg-muted text-foreground font-medium text-sm transition-colors flex items-center justify-center gap-1.5">
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground mb-12">
          Need up to 25 seats, your own domain and a fully white-labeled portal? Agency Scale is $199/month.{" "}
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Agency%20Scale`} className="font-medium text-foreground underline underline-offset-4 hover:text-brand">
            Talk to us
          </a>
        </p>

        {/* ── BOTTOM TRUST & ASSURANCE STRIP ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-md border border-border bg-card p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center"
        >
          {/* Trust 1: No Credit Card */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-md bg-accent/10 border border-accent/20 text-brand flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-0.5">
                No credit card required
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Start with the free plan and explore Frevio at your own pace.
              </p>
            </div>
          </div>

          {/* Trust 2: Upgrade or Downgrade */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-md bg-accent/10 border border-accent/20 text-brand flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-0.5">
                Upgrade or downgrade anytime
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Switch plans or cancel from your billing settings.
              </p>
            </div>
          </div>

          {/* Trust 3: Need a custom plan */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-md bg-accent/10 border border-accent/20 text-brand flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-0.5">
                Free for your clients
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clients never pay and never need an account to use their portal.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
