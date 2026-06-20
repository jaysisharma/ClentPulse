import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse pb-10">

        {/* Back */}
        <Sk className="h-4 w-28 mb-6" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sk className="w-1 h-11 rounded-full" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sk className="h-7 w-48" />
                <Sk className="h-6 w-20 rounded-full" />
              </div>
              <Sk className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Sk className="h-8 w-20 rounded-lg" />
            <Sk className="h-8 w-24 rounded-lg" />
            <Sk className="h-8 w-8 rounded-lg" />
            <Sk className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
              <Sk className="w-4 h-4 rounded" />
              <div className="space-y-1.5">
                <Sk className="h-5 w-16" />
                <Sk className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* Two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Sk className="h-4 w-20" />
                <Sk className="h-8 w-20 rounded-lg" />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Sk className="h-4 w-36" />
                    <Sk className="h-6 w-28 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Sk className="h-3 w-full" />
                    <Sk className="h-3 w-5/6" />
                    <Sk className="h-3 w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Sk className="h-4 w-20" />
                <Sk className="h-4 w-24" />
              </div>
              <Sk className="h-1.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Sk className="h-3 w-20" />
                <Sk className="h-3 w-20" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Sk className="h-4 w-24" />
                <Sk className="h-4 w-10" />
              </div>
              <Sk className="h-1.5 w-full rounded-full" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Sk className="w-4 h-4 rounded-full" />
                  <Sk className="h-3 flex-1" />
                  <Sk className="h-3 w-12" />
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Sk className="h-4 w-24" />
                <div className="flex gap-2">
                  <Sk className="h-7 w-20 rounded-lg" />
                  <Sk className="h-7 w-12 rounded-lg" />
                </div>
              </div>
              <Sk className="h-3 w-full" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
