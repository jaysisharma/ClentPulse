"use client";

import React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import ScreenFrame from "@/components/home/screen-frame";
import SectionHeader from "@/components/home/section-header";

const steps = [
  {
    title: "Set up the project once",
    body: "Add the client, budget and milestones, send the contract to sign, and set a kickoff deposit before any work starts.",
    points: [
      "Milestones and a shared kickoff checklist",
      "Budget, hourly rate and kickoff deposit",
      "Proposals and contracts signed online",
    ],
    screen: { src: "/screens/projects", url: "frevio.cloud/projects", width: 2400, height: 1272 },
    alt: "Frevio projects board with four client projects, milestone progress and amounts paid",
  },
  {
    title: "Share work, get clear answers",
    body: "Your client opens one private link to see the live deliverable, where the project stands and what they owe. Sign-off is a button, not an email thread.",
    points: [
      "Live previews of sites, Figma files, PRs and Loom videos",
      "Approve or request changes in one click",
      "Email alert the moment a client responds",
    ],
    screen: { src: "/screens/portal", url: "frevio.cloud/p/greenearth", width: 2880, height: 1920 },
    alt: "Frevio client portal showing milestone progress, a live design preview and a Sign Off Deliverable button",
  },
  {
    title: "Get approved and get paid",
    body: "Invoices live inside the project and clients pay by card, so nothing stalls while you chase people.",
    points: [
      "Invoices with a Stripe “Pay now” button",
      "One-click reminders for overdue invoices",
      "Tax/VAT and 5 currencies on every invoice",
    ],
    screen: { src: "/screens/invoices", url: "frevio.cloud/invoices", width: 2400, height: 1272 },
    alt: "Frevio invoices list with totals invoiced, paid to date and awaiting payment",
  },
];

export default function HowItWorksConnected() {
  return (
    <section
      id="how-it-works"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background text-foreground border-b border-border"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          kicker="How it works"
          title="From signed contract to paid invoice."
          intro="Every project lives in one place, and your client sees it all through a single private link."
        />

        <div className="space-y-24 sm:space-y-32">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
            >
              <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <span className="inline-flex w-8 h-8 rounded-md border border-border text-muted-foreground font-mono text-sm items-center justify-center mb-5">
                  {i + 1}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{step.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">{step.body}</p>
                <ul className="space-y-3 text-sm sm:text-base">
                  {step.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-1 shrink-0 text-brand stroke-[3]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <ScreenFrame {...step.screen} alt={step.alt} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
