import { cn } from '@/lib/utils'

// Full-bleed responsive canvas for freelancer pages.
// Flat app canvas matching the marketing site's screenshots: #f8f9fc light, #090a0f dark.
export function DarkShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('-mx-4 sm:-mx-6 lg:-mx-8 -mt-18 sm:-mt-20 lg:-mt-8 -mb-4 sm:-mb-6 lg:-mb-8 min-h-screen px-3.5 sm:px-6 lg:px-10 pt-18 sm:pt-20 lg:pt-8 pb-12 animate-fade-in relative overflow-hidden max-w-full bg-[#f8f9fc] dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 transition-colors duration-200 print:m-0 print:p-0 print:bg-white print:text-slate-900 print:min-h-0 print:overflow-visible', className)}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
