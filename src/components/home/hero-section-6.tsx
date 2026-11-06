"use client";
import React from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import Image from "next/image";
import { Check, Lock } from "lucide-react";
import { AnimatedGroup } from "@/components/home/animated-group";
import { SAMPLE_PORTAL_URL, SIGNUP_URL } from "@/components/home/site";

// The freelancer's real dashboard, captured from /dashboard in both themes.
function DashboardShot() {
  return (
    <div className="rounded-lg border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 max-w-xs mx-auto flex items-center justify-center gap-1.5 rounded-md bg-background border border-border px-3 py-1 text-xs text-muted-foreground font-mono truncate">
          <Lock className="w-3 h-3 shrink-0" />
          frevio.cloud/dashboard
        </div>
      </div>
      <Image
        src="/screens/overview-light.webp"
        alt="Frevio dashboard showing active projects, today's tasks, upcoming deadlines and recent client activity"
        width={2880}
        height={1600}
        priority
        sizes="(max-width: 1200px) 100vw, 1152px"
        className="block w-full h-auto dark:hidden"
      />
      <Image
        src="/screens/overview-dark.webp"
        alt="Frevio dashboard showing active projects, today's tasks, upcoming deadlines and recent client activity"
        width={2880}
        height={1600}
        priority
        sizes="(max-width: 1200px) 100vw, 1152px"
        className="hidden w-full h-auto dark:block"
      />
    </div>
  );
}

// What the client sees on their side of the same project.
function ClientPortalCard() {
  return (
    <div className="w-72 rounded-lg border border-border bg-card text-card-foreground shadow-2xl shadow-black/20 dark:shadow-black/60 p-4 text-left">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Client portal</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Working now
        </span>
      </div>
      <p className="text-sm font-semibold">GreenEarth &middot; Website redesign</p>
      <div className="mt-2 mb-4 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full w-[62%] rounded-full bg-accent" />
      </div>
      <div className="rounded-md border border-border p-3 mb-3">
        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mb-0.5">Waiting for your approval</p>
        <p className="text-xs font-medium mb-2">Homepage design &middot; v3</p>
        <div className="grid grid-cols-2 gap-1.5">
          <span className="flex items-center justify-center gap-1 rounded bg-accent text-white text-[11px] font-medium py-1">
            <Check className="w-3 h-3" /> Approve
          </span>
          <span className="text-center rounded border border-border text-[11px] font-medium py-1">Changes</span>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <p className="text-[11px] text-muted-foreground font-mono">Invoice #0014</p>
          <p className="text-sm font-bold">$1,250.00</p>
        </div>
        <span className="rounded bg-accent text-white text-[11px] font-medium px-2.5 py-1">Pay now</span>
      </div>
    </div>
  );
}

export default function HeroSection6() {
  const textVariants: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 1,
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(120%_90%_at_50%_0%,var(--background)_55%,rgba(79,70,229,0.22)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 z-0 bg-gradient-to-b from-transparent to-background" />

      <div className="flex flex-col items-center text-center pt-16 md:pt-24 px-4 pb-20 max-w-6xl mx-auto z-10 relative">
        <AnimatedGroup
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            },
            item: textVariants,
          }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5 leading-[1.1]">
            One link for every client.
            <br />
            No more &ldquo;any updates?&rdquo;
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
            Give each client a private portal with live progress, approvals,
            contracts and invoices &mdash; and lock kickoff until the deposit is paid.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-4">
            <a
              href={SIGNUP_URL}
              className="w-full sm:w-auto px-5 py-2.5 text-base md:text-lg rounded-md bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 transition-all hover:shadow-accent/40 font-medium"
            >
              Start for free
            </a>
            <Link
              href={SAMPLE_PORTAL_URL}
              className="w-full sm:w-auto px-5 py-2.5 text-base md:text-lg rounded-md border border-border bg-background/60 hover:bg-muted transition-colors font-medium text-foreground"
            >
              See a client portal
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mb-14">
            Free for up to 2 projects. No credit card. Your clients never need an account.
          </p>
        </AnimatedGroup>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="relative w-full"
        >
          <DashboardShot />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1, ease: "easeOut" }}
            className="hidden md:block absolute -right-4 lg:-right-10 -bottom-10"
          >
            <ClientPortalCard />
          </motion.div>
          <p className="mt-4 md:mt-14 text-xs text-muted-foreground">
            Your dashboard, and what your client sees on their portal link.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export { HeroSection6 };
