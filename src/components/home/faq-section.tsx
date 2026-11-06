"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import SectionHeader from "@/components/home/section-header";
import { SUPPORT_EMAIL } from "@/components/home/site";


export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      num: "01",
      question: "What is Frevio, and who is it for?",
      answer:
        "Frevio gives every client a private portal where they can see live progress, approve work, sign contracts and pay invoices. It's built for freelancers, studios and small agencies who are tired of status emails, chasing approvals and waiting on payments.",
    },
    {
      num: "02",
      question: "Do my clients need to create an account?",
      answer:
        "No. Each project has a private portal link you send to your client. You can add a passcode if you want extra privacy. Clients can view progress, comment, approve deliverables and pay invoices without signing up.",
    },
    {
      num: "03",
      question: "How do kickoff deposits work?",
      answer:
        "Turn on a deposit for a project and pick 25%, 33% or 50% of the budget. The client portal shows a payment step first, and the project unlocks automatically once the deposit is paid through Stripe.",
    },
    {
      num: "04",
      question: "Can I customize my client portal with my branding?",
      answer:
        "Yes. Pro lets you add your logo and accent color and remove the \u201cPowered by Frevio\u201d footer. Agency Scale goes fully white-label, with your own favicon and your own domain, like status.youragency.com.",
    },
    {
      num: "05",
      question: "Can I manage contracts, invoices, and payments?",
      answer:
        "Yes. Send proposals and contracts that clients sign online, then send itemized invoices with tax/VAT in USD, EUR, GBP, CAD or AUD. Clients pay by card through Stripe, and you can send a reminder for overdue invoices in one click.",
    },
    {
      num: "06",
      question: "I'm a developer. What does the VS Code extension do?",
      answer:
        "It shows your client when you're actively working and which area you're focused on, like frontend or backend. It never sends code, keystrokes or file contents, pauses itself after 5 minutes idle, and turns coding sessions into time entries.",
    },
    {
      num: "07",
      question: "Is there a free plan?",
      answer:
        "Yes. The Free plan includes up to 2 active projects with the client portal, approvals, contracts and Stripe invoicing. No credit card required.",
    },
    {
      num: "08",
      question: "Can I change or cancel my plan anytime?",
      answer:
        "Yes. There are no long-term contracts. You can switch between monthly and yearly billing, change plans, or cancel from your billing settings.",
    },
  ];

  return (
    <section id="faq" className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background text-foreground overflow-hidden border-b border-border">
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-x-14">
        
        <div className="lg:col-span-4">
          <SectionHeader
            kicker="FAQ"
            title="Questions, answered."
            intro={
              <>
                Something else on your mind?{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-foreground underline underline-offset-4">
                  Email us
                </a>
                .
              </>
            }
          />
        </div>

        {/* ── ACCORDION LIST ── */}
        <div className="lg:col-span-8 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className={`rounded-md border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-border bg-card"
                    : "border-border bg-card hover:border-foreground/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-8 h-8 rounded-md border text-xs font-mono font-semibold flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "border-accent/40 bg-accent/10 text-brand"
                          : "border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {faq.num}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
                      {faq.question}
                    </h3>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-7 pl-16 sm:pl-18 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
