import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200/70 dark:bg-white/5 rounded-xl ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <DarkShell>
        <div className="animate-pulse max-w-4xl mx-auto space-y-6 relative z-10 pb-12">
          <Sk className="h-4 w-36" />
          <div className="space-y-2">
            <Sk className="h-4 w-28" />
            <Sk className="h-8 w-56" />
            <Sk className="h-4 w-72" />
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Nav skeleton */}
            <div className="w-full md:w-48 flex-shrink-0 flex md:flex-col gap-1">
              {[...Array(4)].map((_, i) => (
                <Sk key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>

            {/* Panel skeleton */}
            <div className="flex-1 w-full space-y-6">
              <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 space-y-5">
                <Sk className="h-4 w-32" />
                <Sk className="h-10 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Sk className="h-10 rounded-xl" />
                  <Sk className="h-10 rounded-xl" />
                </div>
                <div className="flex gap-2">
                  {[...Array(9)].map((_, j) => (
                    <Sk key={j} className="w-7 h-7 rounded-full" />
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                  <Sk className="h-9 w-28 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

