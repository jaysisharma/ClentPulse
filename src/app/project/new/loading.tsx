import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-xl space-y-6 pb-10">
        <Sk className="h-4 w-32" />
        <div className="space-y-1">
          <Sk className="h-7 w-36" />
          <Sk className="h-4 w-72" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="space-y-4">
            <Sk className="h-4 w-16 mb-2" />
            <Sk className="h-9 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Sk className="h-9 rounded-lg" />
              <Sk className="h-9 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Sk className="h-4 w-20 mb-2" />
            <Sk className="h-9 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Sk className="h-9 rounded-lg" />
              <Sk className="h-9 rounded-lg" />
            </div>
            <div className="flex gap-2">
              {[...Array(9)].map((_, i) => (
                <Sk key={i} className="w-7 h-7 rounded-full" />
              ))}
            </div>
          </div>
          <Sk className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </AppLayout>
  )
}
