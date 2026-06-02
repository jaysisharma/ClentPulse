import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-xl space-y-6">
        <div className="space-y-1">
          <Sk className="h-7 w-24" />
          <Sk className="h-4 w-48" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <Sk className="h-5 w-24" />
            </div>
            <div className="px-6 py-5 space-y-4">
              <Sk className="h-9 w-full rounded-lg" />
              <Sk className="h-9 w-full rounded-lg" />
              <div className="flex gap-2">
                {[...Array(8)].map((_, j) => (
                  <Sk key={j} className="w-8 h-8 rounded-full" />
                ))}
              </div>
              <Sk className="h-8 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
