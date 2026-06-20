'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCw } from 'lucide-react'

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Clients failed to load:', error)
  }, [error])

  return (
    <AppLayout>
      <DarkShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 py-16 px-6 flex flex-col items-center text-center max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-5">We couldn&apos;t load your clients</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
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
