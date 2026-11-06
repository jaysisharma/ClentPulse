import React from "react";
import Image from "next/image";
import { Lock } from "lucide-react";

// A browser-framed product screenshot that swaps with the site theme.
// Expects /public/<src>-light.webp and /public/<src>-dark.webp.
export default function ScreenFrame({
  src,
  url,
  alt,
  width,
  height,
  priority,
  sizes = "(max-width: 1024px) 100vw, 640px",
}: {
  src: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 max-w-xs mx-auto flex items-center justify-center gap-1.5 rounded-md bg-background border border-border px-3 py-1 text-xs text-muted-foreground font-mono truncate">
          <Lock className="w-3 h-3 shrink-0" />
          {url}
        </div>
      </div>
      <Image
        src={`${src}-light.webp`}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="block w-full h-auto dark:hidden"
      />
      <Image
        src={`${src}-dark.webp`}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="hidden w-full h-auto dark:block"
      />
    </div>
  );
}
