import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Sk className="h-7 w-28" />
            <Sk className="h-4 w-44" />
          </div>
          <Sk className="h-8 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Sk className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Sk className="h-4 w-36" />
                <Sk className="h-3 w-full" />
                <Sk className="h-3 w-4/5" />
                <div className="flex gap-2 pt-1">
                  <Sk className="h-5 w-16 rounded-full" />
                  <Sk className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
