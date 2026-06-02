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
            <Sk className="h-4 w-48" />
          </div>
          <Sk className="h-8 w-28 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <Sk className="h-4 w-48" />
                <Sk className="h-3 w-32" />
              </div>
              <Sk className="h-6 w-16 rounded-full" />
              <Sk className="h-3 w-24" />
              <Sk className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
