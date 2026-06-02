import { AppLayout } from '@/components/layout/app-layout'

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-6 pb-10">

        {/* Header */}
        <div className="flex items-start justify-between pt-1">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 px-4 py-4 flex items-center gap-4">
                <Skeleton className="w-1 h-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="hidden sm:block space-y-1 text-right">
                  <Skeleton className="h-3 w-24 ml-auto" />
                  <Skeleton className="h-3 w-20 ml-auto" />
                </div>
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
