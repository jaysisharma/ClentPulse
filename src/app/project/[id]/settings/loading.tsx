import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200/70 dark:bg-white/5 rounded-md ${className}`} />
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
                <Sk key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>

            {/* Panel skeleton */}
            <div className="flex-1 w-full space-y-6">
              <div className="bg-white dark:bg-[#12141c]/90 rounded-md border border-[#eaecf2] dark:border-white/[0.08] p-6 space-y-5">
                <Sk className="h-4 w-32" />
                <Sk className="h-10 w-full rounded-md" />
                <div className="grid grid-cols-2 gap-4">
                  <Sk className="h-10 rounded-md" />
                  <Sk className="h-10 rounded-md" />
                </div>
                <div className="flex gap-2">
                  {[...Array(9)].map((_, j) => (
                    <Sk key={j} className="w-7 h-7 rounded-full" />
                  ))}
                </div>
                <div className="pt-3 border-t border-[#f1f3f7] dark:border-white/[0.05]">
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

