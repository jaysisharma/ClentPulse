"use client";

import React from "react";
import { motion } from "motion/react";

// Shared header so every section uses the same alignment, scale and spacing.
export default function SectionHeader({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="max-w-3xl mb-14 sm:mb-20"
    >
      <p className="text-sm font-semibold text-brand mb-3">{kicker}</p>
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">{title}</h2>
      {intro && (
        <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">{intro}</p>
      )}
      {children}
    </motion.div>
  );
}
