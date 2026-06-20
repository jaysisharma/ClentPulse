import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-8">
        <div className="space-y-2">
          <Sk className="h-7 w-36" />
          <Sk className="h-4 w-56" />
        </div>
        {[...Array(2)].map((_, s) => (
          <div key={s} className="space-y-3">
            <Sk className="h-4 w-32" />
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sk className="h-4 w-28" />
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => <Sk key={j} className="w-3.5 h-3.5 rounded" />)}
                      </div>
                    </div>
                    <Sk className="h-3 w-32" />
                    <Sk className="h-4 w-full" />
                    <Sk className="h-4 w-5/6" />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Sk className="h-8 w-20 rounded-lg" />
                    <Sk className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
