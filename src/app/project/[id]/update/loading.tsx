import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-6 max-w-6xl">
        <Sk className="h-4 w-36" />
        <div className="space-y-1">
          <Sk className="h-7 w-56" />
          <Sk className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="space-y-3">
              <Sk className="h-4 w-36 mb-2" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <Sk className="w-6 h-6 rounded-full" />
                  <Sk className="h-4 flex-1" />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Sk className="h-4 w-40" />
              <Sk className="h-24 w-full rounded-xl" />
            </div>
            <div className="flex gap-3 pt-2">
              <Sk className="h-10 flex-1 rounded-lg" />
              <Sk className="h-10 flex-1 rounded-lg" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-3">
            <Sk className="h-4 w-28" />
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1">
                <Sk className="h-3 w-32" />
                <Sk className="h-3 w-48" />
              </div>
              <div className="p-6 space-y-4">
                <Sk className="h-12 w-full rounded-xl" />
                <Sk className="h-4 w-40" />
                {[...Array(3)].map((_, i) => <Sk key={i} className="h-4 w-full" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
