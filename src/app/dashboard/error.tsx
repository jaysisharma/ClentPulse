'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard failed to load:', error)
  }, [error])

  return (
    <AppLayout dark>
      <DarkShell dark>
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="rounded-3xl bg-slate-900 border border-slate-800/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),0_12px_32px_-12px_rgba(225,29,72,0.2)] py-16 px-6 flex flex-col items-center text-center max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/40 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-white mt-5">We couldn&apos;t load your dashboard</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              Something went wrong while fetching your data — this is on us, not you. Your work is safe. Try again in a moment.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <Button onClick={() => reset()}>
                <RotateCw className="w-4 h-4" />
                Try again
              </Button>
              <Link href="/project">
                <Button variant="secondary">Go to projects</Button>
              </Link>
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
