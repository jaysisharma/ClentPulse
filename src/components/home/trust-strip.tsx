import React from "react";
import { FigmaIcon, GitHubIcon, StripeIcon, VSCodeIcon } from "@/components/ui/brand-icons";

const tools = [
  { name: "Stripe", Logo: StripeIcon },
  { name: "GitHub", Logo: GitHubIcon },
  { name: "Figma", Logo: FigmaIcon },
  { name: "VS Code", Logo: VSCodeIcon },
];

export default function TrustStrip() {
  return (
    <section className="w-full border-y border-border bg-muted/30 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
        <p className="text-sm text-muted-foreground shrink-0">Works with the tools you already use</p>
        <ul className="flex flex-wrap items-center justify-center lg:justify-between gap-x-10 gap-y-5 flex-1">
          {tools.map(({ name, Logo }) => (
            <li
              key={name}
              className="flex items-center gap-2.5 text-foreground/70 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition"
            >
              <Logo className="w-6 h-6" />
              <span className="text-base font-semibold tracking-tight">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
