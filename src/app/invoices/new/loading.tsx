import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200/70 dark:bg-white/5 rounded-xl ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <DarkShell>
        <div className="animate-pulse max-w-3xl space-y-6 relative z-10 pb-12">
          <Sk className="h-4 w-28" />
          <div className="space-y-2">
            <Sk className="h-4 w-24" />
            <Sk className="h-8 w-48" />
            <Sk className="h-4 w-64" />
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-5">
              <Sk className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <Sk className="h-10 rounded-xl" />
                <Sk className="h-10 rounded-xl" />
              </div>
              <Sk className="h-10 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <Sk className="h-10 rounded-xl" />
                <Sk className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-4">
              <Sk className="h-4 w-28" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Sk className="flex-1 h-10 rounded-xl" />
                    <Sk className="w-20 h-10 rounded-xl" />
                    <Sk className="w-28 h-10 rounded-xl" />
                    <Sk className="w-8 h-10 rounded-xl" />
                  </div>
                ))}
              </div>
              <Sk className="h-9 w-32 rounded-full" />
            </div>

            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-3">
              <Sk className="h-4 w-36" />
              <Sk className="h-20 w-full rounded-xl" />
            </div>

            <div className="flex gap-3 pt-2">
              <Sk className="h-10 flex-1 rounded-full" />
              <Sk className="h-10 flex-1 rounded-full" />
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

