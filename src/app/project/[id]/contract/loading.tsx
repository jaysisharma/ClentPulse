import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-2xl space-y-6 py-6">
        <Sk className="h-4 w-28" />
        <div className="space-y-1">
          <Sk className="h-7 w-44" />
          <Sk className="h-4 w-64" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <Sk className="h-9 w-full rounded-lg" />
          <Sk className="h-9 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Sk className="h-9 rounded-lg" />
            <Sk className="h-9 rounded-lg" />
          </div>
          <Sk className="h-32 w-full rounded-lg" />
          <Sk className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </AppLayout>
  )
}
