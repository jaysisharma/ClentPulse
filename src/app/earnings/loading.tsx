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
            <Sk className="h-4 w-44" />
          </div>
          <Sk className="h-8 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <Sk className="h-7 w-28" />
              <Sk className="h-4 w-24" />
              <Sk className="h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sk className="h-4 w-4 rounded" />
            <Sk className="h-4 w-56" />
          </div>
          <div className="flex items-end gap-2 h-48">
            {[...Array(12)].map((_, i) => {
              const heights = [20, 35, 15, 55, 40, 70, 45, 80, 60, 90, 55, 75]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-slate-200 rounded-t-md" style={{ height: `${heights[i]}%` }} />
                  <Sk className="h-3 w-6" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
