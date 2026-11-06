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
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Sk className="h-4 w-24" />
              <Sk className="h-8 w-48" />
              <Sk className="h-4 w-56" />
            </div>
            <Sk className="h-9 w-28 rounded-full" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#12141c]/90 rounded-md border border-[#eaecf2] dark:border-white/[0.08] overflow-hidden">
                <div className="flex items-center justify-between p-5">
                  <div className="space-y-2">
                    <Sk className="h-4 w-40" />
                    <Sk className="h-3 w-28" />
                  </div>
                  <Sk className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

