import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Sk className="h-7 w-32" />
            <Sk className="h-4 w-48" />
          </div>
          <Sk className="h-8 w-28 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
              <Sk className="h-4 w-20" />
              <Sk className="h-7 w-24" />
              <Sk className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Timer card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            <Sk className="h-12 w-24 rounded-none" />
            <Sk className="h-12 w-24 rounded-none" />
          </div>
          <div className="p-5 flex gap-3">
            <Sk className="flex-1 h-10 rounded-xl" />
            <Sk className="w-36 h-10 rounded-xl" />
            <Sk className="w-20 h-10 rounded-xl" />
          </div>
        </div>

        {/* Entry list */}
        <div className="space-y-6">
          {[...Array(3)].map((_, d) => (
            <div key={d}>
              <div className="flex justify-between mb-2.5">
                <Sk className="h-4 w-36" />
                <Sk className="h-4 w-12" />
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
                    <Sk className="w-2.5 h-2.5 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Sk className="h-4 w-48" />
                      <Sk className="h-3 w-28" />
                    </div>
                    <Sk className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
