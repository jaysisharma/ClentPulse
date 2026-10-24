import { Shield, Sparkles } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top indeterminate progress line */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-rose-500/10">
        <div className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 animate-admin-progress" />
      </div>

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-rose-500/20 animate-pulse flex items-center justify-center text-rose-500">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-3.5 w-64 bg-slate-100 dark:bg-slate-800/60 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-8 w-28 bg-rose-500/10 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-7 w-28 bg-slate-300 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main panel skeleton */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map(row => (
            <div
              key={row}
              className="h-14 rounded-xl bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-white/5 animate-pulse flex items-center px-4 justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-850 rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
