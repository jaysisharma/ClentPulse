"use client";

import React from "react";
import { motion } from "motion/react";
import SectionHeader from "@/components/home/section-header";
import { MailQuestion, Hourglass, Banknote, ArrowRight } from "lucide-react";

const problems = [
  {
    icon: MailQuestion,
    pain: "“Hey, any update on this?”",
    detail:
      "You stop real work to write status emails, and clients still feel out of the loop.",
    fix: "Clients check one live portal with progress, milestones and what you’re working on now.",
  },
  {
    icon: Hourglass,
    pain: "Approvals stuck in someone’s inbox",
    detail:
      "The design is ready, but sign-off is buried in a thread and the timeline slips.",
    fix: "Approve or request changes is one click on the portal, and you get an email the moment they answer.",
  },
  {
    icon: Banknote,
    pain: "Working first, chasing money later",
    detail:
      "You start before the deposit lands, then spend weeks nudging people about invoices.",
    fix: "Kickoff stays locked until the deposit is paid, and every invoice has a Pay now button.",
  },
];

export default function ProblemSection() {
  return (
    <section className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background text-foreground border-b border-border">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          kicker="The problem"
          title={
            <>
              Client work isn&apos;t hard.
              <br />
              <span className="text-muted-foreground">Managing clients is.</span>
            </>
          }
          intro="Most freelancers lose hours every week to the same three problems."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map(({ icon: Icon, pain, detail, fix }, i) => (
            <motion.div
              key={pain}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="rounded-md border border-border bg-card p-6 sm:p-7 flex flex-col"
            >
              <div className="w-10 h-10 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight mb-2">{pain}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{detail}</p>
              <div className="mt-auto pt-5 border-t border-border flex items-start gap-2.5 text-sm">
                <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                <p className="leading-relaxed">
                  <span className="font-semibold">With Frevio: </span>
                  {fix}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
