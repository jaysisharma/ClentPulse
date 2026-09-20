import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200/70 dark:bg-white/5 rounded-xl ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <DarkShell>
        <div className="animate-pulse max-w-3xl space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Sk className="h-4 w-32" />
            <div className="flex gap-2">
              <Sk className="h-8 w-20 rounded-full" />
              <Sk className="h-8 w-20 rounded-full" />
              <Sk className="h-8 w-24 rounded-full" />
            </div>
          </div>
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-8 space-y-8 backdrop-blur-md">
            <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-white/5">
              <Sk className="h-8 w-64" />
              <div className="flex gap-3">
                <Sk className="h-5 w-20 rounded-full" />
                <Sk className="h-5 w-16 rounded-full" />
                <Sk className="h-5 w-28" />
              </div>
            </div>
            <div className="space-y-4">
              <Sk className="h-4 w-full" />
              <Sk className="h-4 w-5/6" />
              <Sk className="h-4 w-4/6" />
              <Sk className="h-32 w-full rounded-xl" />
              <Sk className="h-4 w-3/4" />
              <Sk className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
