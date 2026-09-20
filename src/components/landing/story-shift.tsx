'use client'

export function StoryShift() {
  return (
    <section className="relative bg-[#07080b] py-20 sm:py-28 px-6 text-center border-t border-white/[0.04] overflow-hidden">
      {/* Precision vertical divider line */}
      <div className="mx-auto w-px h-12 bg-gradient-to-b from-indigo-500/60 to-transparent mb-8" />

      <div className="max-w-3xl mx-auto">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-indigo-400 font-medium mb-4 block">
          02 — The Shift
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.035em] text-white leading-tight mb-4">
          Then they opened the link.
        </h2>

        <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed max-w-xl mx-auto">
          No passwords to invent. No cluttered attachments to download. One unified encrypted portal where clients see the entire picture at a glance.
        </p>
      </div>
    </section>
  )
}
