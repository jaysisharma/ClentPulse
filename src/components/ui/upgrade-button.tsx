'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export function UpgradeButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/upgrade', { method: 'POST' })
    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    router.push('/dashboard?upgraded=1')
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleUpgrade} loading={loading} className="w-full justify-center text-base py-3">
        <Zap className="w-4 h-4" />
        Upgrade to Pro — free for now
      </Button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  )
}
