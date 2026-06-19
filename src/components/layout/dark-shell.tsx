// Full-bleed canvas for freelancer pages. Breaks out of AppLayout's
// padding so the background runs edge-to-edge, then re-applies its own.
// Clean, soft light canvas — the cards carry the design, not the backdrop.
export function DarkShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-6 lg:-mx-8 -mt-20 lg:-mt-8 -mb-6 lg:-mb-8 min-h-screen bg-[#f6f7f4] text-slate-900 px-5 lg:px-10 pt-20 lg:pt-8 pb-12 animate-fade-in relative overflow-hidden">
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
