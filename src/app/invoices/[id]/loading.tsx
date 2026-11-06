import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200/70 dark:bg-white/5 rounded-md ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <DarkShell>
        <div className="animate-pulse max-w-3xl space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Sk className="h-4 w-32" />
            <div className="flex gap-2">
              <Sk className="h-9 w-24 rounded-full" />
              <Sk className="h-9 w-24 rounded-full" />
            </div>
          </div>
          <div className="bg-white dark:bg-[#12141c]/90 rounded-md border border-[#eaecf2] dark:border-white/[0.08] p-8 space-y-8 backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Sk className="h-7 w-28" />
                <Sk className="h-4 w-40" />
              </div>
              <Sk className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Sk className="h-3 w-16" />
                <Sk className="h-4 w-32" />
                <Sk className="h-4 w-40" />
              </div>
              <div className="space-y-2">
                <Sk className="h-3 w-16" />
                <Sk className="h-4 w-32" />
                <Sk className="h-4 w-40" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-[#f1f3f7] dark:border-white/[0.05]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Sk className="flex-1 h-4" />
                  <Sk className="h-4 w-12" />
                  <Sk className="h-4 w-20" />
                  <Sk className="h-4 w-20" />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-[#f1f3f7] dark:border-white/[0.05]">
              <div className="space-y-2 text-right">
                <Sk className="h-4 w-32 ml-auto" />
                <Sk className="h-6 w-24 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
