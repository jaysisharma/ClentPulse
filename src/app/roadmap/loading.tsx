import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-8">
        <div className="space-y-2">
          <Sk className="h-7 w-28" />
          <Sk className="h-4 w-56" />
        </div>
        {[...Array(3)].map((_, s) => (
          <div key={s} className="space-y-3">
            <Sk className="h-5 w-24" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-start gap-4">
                <Sk className="w-5 h-5 rounded-full mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Sk className="h-4 w-48" />
                  <Sk className="h-3 w-full" />
                  <Sk className="h-3 w-4/5" />
                </div>
                <Sk className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
