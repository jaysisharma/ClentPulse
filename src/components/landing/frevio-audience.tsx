'use client'

export function FrevioAudience() {
  const audiences = [
    {
      role: 'Web Developers',
      useCase: 'Shipping production code, linking staging previews and repositories, and getting formal milestone sign-off before launch.',
    },
    {
      role: 'Product & Brand Designers',
      useCase: 'Sharing Figma prototypes and brand assets, managing revisions without lost email attachments, and presenting design iterations cleanly.',
    },
    {
      role: 'Content Creators & Copywriters',
      useCase: 'Submitting drafts, briefs, and campaign assets with clear review milestones, feedback notes, and integrated billing.',
    },
    {
      role: 'Consultants & Strategists',
      useCase: 'Delivering weekly executive summaries, organizing roadmap deliverables, and keeping stakeholders aligned on timeline and budget.',
    },
    {
      role: 'Boutique Studios & Agencies',
      useCase: 'Managing multiple client relationships across team members, with shared access, custom branding, and transparent progress oversight.',
    },
  ]

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#08090a] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-14 space-y-3">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            Audience
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Built for people who work with clients.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Whether you operate as an independent freelancer or a growing studio, Frevio gives your client engagements a clean, professional structure.
          </p>
        </div>

        {/* Compact, Text-Driven Editorial Rows */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {audiences.map((item, idx) => (
            <div
              key={idx}
              className="py-6 sm:py-7 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 items-baseline"
            >
              <div className="md:col-span-4">
                <span className="text-base sm:text-lg font-medium text-white">
                  {item.role}
                </span>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                  {item.useCase}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
