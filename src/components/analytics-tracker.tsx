'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    // Prevent double-tracking in dev environments / React StrictMode if the path hasn't changed
    if (lastTrackedPath.current === pathname) return
    lastTrackedPath.current = pathname

    // Check if the current route belongs to the private freelancer dashboard
    const isFreelancerRoute = [
      '/dashboard', '/project', '/clients', '/settings', '/invoices', '/docs',
      '/time', '/earnings', '/testimonials', '/portfolio', '/archive', '/upgrade',
      '/admin'
    ].some(prefix => pathname.startsWith(prefix))

    // Do not log private routes, API requests, Next.js assets, or static files
    if (
      isFreelancerRoute ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.') ||
      pathname.startsWith('/auth/callback')
    ) {
      return
    }

    const trackVisit = async () => {
      try {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        const utm_source = urlParams?.get('utm_source') || null
        const utm_medium = urlParams?.get('utm_medium') || null
        const utm_campaign = urlParams?.get('utm_campaign') || null

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            referrer: typeof document !== 'undefined' ? document.referrer || null : null,
            utm_source,
            utm_medium,
            utm_campaign,
          }),
        })
      } catch (err) {
        console.error('[AnalyticsTracker] Failed to send analytics tracking call:', err)
      }
    }

    // Defer slightly to let page title / meta load or make it asynchronous
    const timer = setTimeout(trackVisit, 200)
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
