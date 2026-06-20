import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <DarkShell>
        <div className="animate-pulse space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Sk className="h-8 w-28" />
              <Sk className="h-4 w-52" />
            </div>
            <Sk className="h-9 w-32 rounded-xl" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
                <Sk className="h-8 w-12" />
                <Sk className="h-4 w-28" />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Sk className="h-11 flex-1 rounded-xl" />
            <Sk className="h-11 w-56 rounded-xl" />
          </div>

          {/* Client cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-start gap-3.5">
                  <Sk className="w-11 h-11 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Sk className="h-4 w-36" />
                    <Sk className="h-3 w-48" />
                  </div>
                  <Sk className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex gap-4 mt-4">
                  <Sk className="h-3 w-20" />
                  <Sk className="h-3 w-24" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <Sk className="h-7 w-32 rounded-lg" />
                  <Sk className="h-7 w-28 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
