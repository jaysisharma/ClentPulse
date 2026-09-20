import { cn } from '@/lib/utils'

// Full-bleed responsive canvas for freelancer pages.
// In dark mode: overads.io deep dark luxury palette (#08090a).
// In light mode: crisp, polished studio slate palette (#f8fafc / slate-50).
export function DarkShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('-mx-6 lg:-mx-8 -mt-20 lg:-mt-8 -mb-6 lg:-mb-8 min-h-screen px-5 lg:px-10 pt-20 lg:pt-8 pb-12 animate-fade-in relative overflow-hidden bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-slate-100 transition-colors duration-200', className)}>
      {/* Dark mode ambient soft glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(99, 102, 241, 0.08), transparent 70%), #08090a',
        }}
      />
      {/* Light mode ambient soft glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 block dark:hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(99, 102, 241, 0.04), transparent 70%), #f8fafc',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
