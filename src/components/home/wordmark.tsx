import React from "react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

// Brand mark plus name, sized by the parent's font size.
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold tracking-tight text-foreground", className)}>
      <Logo className="w-7 h-7 text-foreground" />
      <span>Frevio</span>
    </span>
  );
}
