import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse max-w-xl space-y-6 pb-10">
        <Sk className="h-4 w-32" />
        <div className="space-y-1">
          <Sk className="h-7 w-36" />
          <Sk className="h-4 w-72" />
        </div>
        <div className="bg-white dark:bg-[#12141c] rounded-md border border-[#eaecf2] dark:border-white/[0.08] p-6 space-y-6">
          <div className="space-y-4">
            <Sk className="h-4 w-16 mb-2" />
            <Sk className="h-9 w-full rounded-md" />
            <div className="grid grid-cols-2 gap-4">
              <Sk className="h-9 rounded-md" />
              <Sk className="h-9 rounded-md" />
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-[#f1f3f7] dark:border-white/[0.08]">
            <Sk className="h-4 w-20 mb-2" />
            <Sk className="h-9 w-full rounded-md" />
            <div className="grid grid-cols-2 gap-4">
              <Sk className="h-9 rounded-md" />
              <Sk className="h-9 rounded-md" />
            </div>
            <div className="flex gap-2">
              {[...Array(9)].map((_, i) => (
                <Sk key={i} className="w-7 h-7 rounded-full" />
              ))}
            </div>
          </div>
          <Sk className="h-10 w-full rounded-md" />
        </div>
      </div>
    </AppLayout>
  )
}
