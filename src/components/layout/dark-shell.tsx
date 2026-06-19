import { cn } from '@/lib/utils'

// Full-bleed canvas for freelancer pages. Breaks out of AppLayout's
// padding so the background runs edge-to-edge, then re-applies its own.
// Default is the clean soft-light canvas; pass `dark` for the dark dashboard.
export function DarkShell({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={cn(
        '-mx-6 lg:-mx-8 -mt-20 lg:-mt-8 -mb-6 lg:-mb-8 min-h-screen px-5 lg:px-10 pt-20 lg:pt-8 pb-12 animate-fade-in relative overflow-hidden',
        dark ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f7f4] text-slate-900',
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
