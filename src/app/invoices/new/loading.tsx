import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-3xl space-y-6">
        <div className="space-y-1">
          <Sk className="h-7 w-32" />
          <Sk className="h-4 w-56" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Sk className="h-9 rounded-lg" />
            <Sk className="h-9 rounded-lg" />
          </div>
          <Sk className="h-9 w-full rounded-lg" />
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Sk className="flex-1 h-9 rounded-lg" />
                <Sk className="w-20 h-9 rounded-lg" />
                <Sk className="w-28 h-9 rounded-lg" />
                <Sk className="w-8 h-9 rounded-lg" />
              </div>
            ))}
            <Sk className="h-8 w-28 rounded-lg" />
          </div>
          <Sk className="h-24 w-full rounded-lg" />
          <div className="flex gap-3 pt-2">
            <Sk className="h-10 w-32 rounded-lg" />
            <Sk className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
