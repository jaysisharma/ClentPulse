import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200/70 dark:bg-white/5 rounded-md ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <DarkShell>
        <div className="animate-pulse max-w-2xl space-y-6 relative z-10 pb-12">
          <Sk className="h-4 w-28" />
          <div className="space-y-2">
            <Sk className="h-4 w-24" />
            <Sk className="h-8 w-48" />
            <Sk className="h-4 w-64" />
          </div>
          <div className="bg-white dark:bg-[#12141c]/90 rounded-md border border-[#eaecf2] dark:border-white/[0.08] p-6 sm:p-7 space-y-5">
            <Sk className="h-10 w-full rounded-md" />
            <div className="grid grid-cols-2 gap-4">
              <Sk className="h-10 rounded-md" />
              <Sk className="h-10 rounded-md" />
            </div>
            <Sk className="h-32 w-full rounded-md" />
            <div className="flex gap-2.5 pt-2 border-t border-[#f1f3f7] dark:border-white/[0.05]">
              <Sk className="h-10 w-32 rounded-full" />
              <Sk className="h-10 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

