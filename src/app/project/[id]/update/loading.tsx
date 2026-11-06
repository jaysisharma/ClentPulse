import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200/70 dark:bg-white/5 rounded-md ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-pulse space-y-6 max-w-6xl pb-12">
          <Sk className="h-4 w-36" />
          <div className="space-y-2">
            <Sk className="h-4 w-28" />
            <Sk className="h-8 w-64" />
            <Sk className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 bg-white dark:bg-[#12141c]/90 rounded-md border border-[#eaecf2] dark:border-white/[0.08] p-6 sm:p-7 space-y-6">
              <div className="space-y-3">
                <Sk className="h-4 w-44 mb-2" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center bg-slate-50 dark:bg-white/[0.03] border border-[#eaecf2] dark:border-white/[0.05] p-3 rounded-md">
                    <Sk className="w-6 h-6 rounded-md" />
                    <Sk className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-[#f1f3f7] dark:border-white/[0.05] space-y-2">
                <Sk className="h-4 w-40" />
                <Sk className="h-24 w-full rounded-md" />
              </div>
              <div className="flex gap-3 pt-2">
                <Sk className="h-10 flex-1 rounded-full" />
                <Sk className="h-10 flex-1 rounded-full" />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-3">
              <Sk className="h-4 w-28" />
              <div className="bg-white dark:bg-[#12141c]/90 rounded-md border border-[#eaecf2] dark:border-white/[0.08] overflow-hidden">
                <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-[#eaecf2] dark:border-white/[0.05] px-4 py-3 space-y-1">
                  <Sk className="h-3 w-32" />
                  <Sk className="h-3 w-48" />
                </div>
                <div className="p-6 space-y-4">
                  <Sk className="h-12 w-full rounded-md" />
                  <Sk className="h-4 w-40" />
                  {[...Array(3)].map((_, i) => <Sk key={i} className="h-4 w-full" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

