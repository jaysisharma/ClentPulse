import { AppLayout } from '@/components/layout/app-layout'

function Sk({ className }: { className: string }) {
  return <div className={`bg-slate-200 rounded-lg ${className}`} />
}

export default function Loading() {
  return (
    <AppLayout>
      <div className="animate-pulse space-y-6">
        <div className="space-y-2">
          <Sk className="h-7 w-24" />
          <Sk className="h-4 w-44" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <Sk className="h-8 w-12" />
              <Sk className="h-4 w-28" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-4">
                <Sk className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-4 w-40" />
                  <Sk className="h-3 w-52" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center space-y-1">
                    <Sk className="h-4 w-8 mx-auto" />
                    <Sk className="h-3 w-12" />
                  </div>
                  <div className="text-center space-y-1">
                    <Sk className="h-4 w-8 mx-auto" />
                    <Sk className="h-3 w-14" />
                  </div>
                  <Sk className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <Sk className="h-7 w-32 rounded-lg" />
                <Sk className="h-7 w-28 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
