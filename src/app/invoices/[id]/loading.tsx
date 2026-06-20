import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-3xl mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between">
          <Sk className="h-4 w-28" />
          <div className="flex gap-2">
            <Sk className="h-8 w-24 rounded-lg" />
            <Sk className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Sk className="h-8 w-16" />
              <Sk className="h-4 w-32" />
            </div>
            <Sk className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <Sk className="h-3 w-16" />
              <Sk className="h-4 w-32" />
              <Sk className="h-4 w-40" />
            </div>
            <div className="space-y-2">
              <Sk className="h-3 w-16" />
              <Sk className="h-4 w-32" />
              <Sk className="h-4 w-40" />
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Sk className="flex-1 h-4" />
                <Sk className="h-4 w-12" />
                <Sk className="h-4 w-20" />
                <Sk className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2 text-right">
              <Sk className="h-4 w-32 ml-auto" />
              <Sk className="h-6 w-24 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
