import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-6">
        <div className="space-y-2">
          <Sk className="h-7 w-24" />
          <Sk className="h-4 w-36" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
              <Sk className="w-3 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Sk className="h-4 w-44" />
                <Sk className="h-3 w-28" />
              </div>
              <div className="text-right space-y-1">
                <Sk className="h-3 w-28 ml-auto" />
                <Sk className="h-3 w-24 ml-auto" />
              </div>
              <Sk className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
