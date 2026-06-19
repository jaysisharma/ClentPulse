import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-slate-800 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout dark>
      <DarkShell dark>
        <div className="animate-pulse space-y-8 pb-10">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3 pt-1">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>

          {/* 4 number cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900/70 border border-slate-800/50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* Chart (hero) */}
          <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 sm:p-7 space-y-7">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-52 rounded-lg" />
            </div>
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>

          {/* Needs attention */}
          <div className="space-y-3">
            <Skeleton className="h-3 w-28" />
            <div className="bg-slate-900/70 border border-slate-800/50 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Active projects */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="bg-slate-900/70 border border-slate-800/50 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <Skeleton className="w-2.5 h-2.5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
