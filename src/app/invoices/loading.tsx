import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Sk className="h-7 w-24" />
            <Sk className="h-4 w-48" />
          </div>
          <Sk className="h-8 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
              <Sk className="h-7 w-28" />
              <Sk className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <Sk className="h-4 w-32" />
                <Sk className="h-3 w-24" />
              </div>
              <Sk className="h-6 w-16 rounded-full" />
              <Sk className="h-4 w-20" />
              <Sk className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
