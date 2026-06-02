import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-6 pb-10">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Sk className="h-8 w-36" />
            <Sk className="h-4 w-52" />
          </div>
          <Sk className="h-8 w-28 rounded-lg" />
        </div>

        {/* Filter bar */}
        <div className="flex gap-3">
          <Sk className="h-9 w-64 rounded-lg" />
          <Sk className="h-9 w-64 rounded-lg" />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="h-[3px] bg-slate-200 w-full" />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <Sk className="h-4 w-40" />
                    <Sk className="h-3 w-28" />
                  </div>
                  <Sk className="h-6 w-16 rounded-full" />
                </div>
                <Sk className="h-8 w-48 rounded-lg" />
                <div className="flex gap-4 pt-1 border-t border-slate-100">
                  <Sk className="h-3 w-20" />
                  <Sk className="h-3 w-16" />
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between">
                <Sk className="h-4 w-24" />
                <Sk className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
