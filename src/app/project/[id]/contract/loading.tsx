import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200/70 dark:bg-white/5 rounded-xl ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <DarkShell>
        <div className="animate-pulse max-w-2xl space-y-6 relative z-10 pb-12">
          <Sk className="h-4 w-28" />
          <div className="space-y-2">
            <Sk className="h-4 w-24" />
            <Sk className="h-8 w-48" />
            <Sk className="h-4 w-64" />
          </div>
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-5">
            <Sk className="h-10 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Sk className="h-10 rounded-xl" />
              <Sk className="h-10 rounded-xl" />
            </div>
            <Sk className="h-32 w-full rounded-xl" />
            <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
              <Sk className="h-10 w-32 rounded-full" />
              <Sk className="h-10 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

