import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-xl space-y-6 py-6">
        <Sk className="h-4 w-36" />
        <div className="space-y-1">
          <Sk className="h-7 w-44" />
          <Sk className="h-4 w-72" />
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <Sk className="h-4 w-24 mb-2" />
            <Sk className="h-9 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Sk className="h-9 rounded-lg" />
              <Sk className="h-9 rounded-lg" />
            </div>
            <div className="flex gap-2">
              {[...Array(9)].map((_, j) => (
                <Sk key={j} className="w-7 h-7 rounded-full" />
              ))}
            </div>
          </div>
        ))}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <Sk className="h-4 w-36" />
            <Sk className="h-3 w-64" />
          </div>
          <Sk className="h-8 w-24 rounded-lg" />
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 space-y-3">
          <Sk className="h-4 w-28" />
          <Sk className="h-3 w-full" />
          <Sk className="h-8 w-48 rounded-lg" />
        </div>
      </div>
    </AppLayout>
  )
}
