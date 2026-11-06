import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-xl space-y-6">
        <div className="space-y-1">
          <Sk className="h-7 w-24" />
          <Sk className="h-4 w-48" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#12141c] rounded-md border border-[#eaecf2] dark:border-white/[0.08] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#f1f3f7] dark:border-white/[0.08]">
              <Sk className="h-5 w-24" />
            </div>
            <div className="px-6 py-5 space-y-4">
              <Sk className="h-9 w-full rounded-md" />
              <Sk className="h-9 w-full rounded-md" />
              <div className="flex gap-2">
                {[...Array(8)].map((_, j) => (
                  <Sk key={j} className="w-8 h-8 rounded-full" />
                ))}
              </div>
              <Sk className="h-8 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
