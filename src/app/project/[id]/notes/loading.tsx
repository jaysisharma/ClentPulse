import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-2xl space-y-6">
        <Sk className="h-4 w-28" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Sk className="h-7 w-36" />
            <Sk className="h-4 w-56" />
          </div>
          <Sk className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div className="space-y-1.5">
                  <Sk className="h-4 w-32" />
                  <Sk className="h-3 w-24" />
                </div>
                <Sk className="h-4 w-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
