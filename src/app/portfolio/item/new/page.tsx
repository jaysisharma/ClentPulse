'use client'

import { Suspense } from 'react'
import { PortfolioItemForm } from '../_form'
import { Loader2 } from 'lucide-react'

export default function NewPortfolioItemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            Loading studio…
          </div>
        </div>
      }
    >
      <PortfolioItemForm />
    </Suspense>
  )
}
