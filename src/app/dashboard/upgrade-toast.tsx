'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export function UpgradeToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(searchParams.get('upgraded') === '1')

  useEffect(() => {
    const upgraded = searchParams.get('upgraded')
    if (upgraded !== '1') return
    router.replace('/dashboard')
    const t = setTimeout(() => setShow(false), 5000)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  return (
    <div className="mb-6 bg-indigo-600 text-white rounded-xl px-5 py-4 flex items-center gap-3 animate-fade-in">
      <Zap className="w-5 h-5 flex-shrink-0" />
      <div>
        <div className="font-semibold text-sm">Welcome to Pro!</div>
        <div className="text-indigo-200 text-xs mt-0.5">All Pro features are now unlocked.</div>
      </div>
    </div>
  )
}
