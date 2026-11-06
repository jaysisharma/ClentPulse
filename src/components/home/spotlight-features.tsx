"use client";

import React from "react";
import { motion } from "motion/react";
import { Check, Lock, ShieldCheck } from "lucide-react";

function DepositGatePreview() {
  return (
    <div className="rounded-lg border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/40 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-md bg-accent/10 text-brand flex items-center justify-center">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Mobile app MVP &middot; Northwind</p>
          <p className="font-semibold">Pay the deposit to start your project</p>
        </div>
      </div>

      <div className="rounded-md bg-muted/50 border border-border p-4 mb-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Project budget</span>
          <span>$8,000.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Kickoff deposit (50%)</span>
          <span className="font-semibold">$4,000.00</span>
        </div>
      </div>

      <span className="block w-full text-center rounded-md bg-accent text-white text-sm font-medium py-2.5 mb-3">
        Pay $4,000 deposit
      </span>
      <p className="text-xs text-muted-foreground text-center">
        Milestones and updates unlock once the deposit is paid.
      </p>
    </div>
  );
}

function PresencePreview() {
  return (
    <div className="rounded-lg border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/40 p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="font-semibold">Developer activity</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Working now
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">Focus area</p>
          <p className="font-semibold">Frontend &amp; UI</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">Today</p>
          <p className="font-semibold">2h 40m</p>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {[
          ["Backend", "Yesterday · 3h 05m"],
          ["Testing", "Mon · 1h 20m"],
        ].map(([area, when]) => (
          <li key={area} className="flex justify-between border-b border-border pb-2 last:border-0">
            <span>{area}</span>
            <span className="text-muted-foreground">{when}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        Only the focus area is shared. Never code, keystrokes or file names.
      </p>
    </div>
  );
}

const features = [
  {
    kicker: "Deposit gate",
    title: "Get paid before you start.",
    body: "Turn on a kickoff deposit of 25%, 33% or 50%. Your client’s portal shows a payment step first, and the project unlocks automatically when Stripe confirms the payment.",
    points: [
      "Deposit presets based on the project budget",
      "Paid by card through Stripe Checkout",
      "Project status updates itself when the payment lands",
    ],
    preview: <DepositGatePreview />,
  },
  {
    kicker: "For developers",
    title: "Let clients see you’re on it.",
    body: "The Frevio extension for VS Code shows clients when you’re actively working and on what part of the project, without you writing a single status update.",
    points: [
      "Live “Working now” badge on the client portal",
      "Pauses itself after 5 minutes idle",
      "Coding sessions become time entries automatically",
    ],
    preview: <PresencePreview />,
  },
];

export default function SpotlightFeatures() {
  return (
    <section
      id="features"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30 text-foreground border-b border-border"
    >
      <div className="max-w-7xl mx-auto space-y-24 sm:space-y-32">
        {features.map((f, i) => (
          <motion.div
            key={f.kicker}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          >
            <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
              <p className="text-sm font-semibold text-brand mb-3">{f.kicker}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-4">{f.title}</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">{f.body}</p>
              <ul className="space-y-3 text-sm sm:text-base">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : undefined}>{f.preview}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
