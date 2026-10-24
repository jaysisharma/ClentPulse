'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AdminContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
  isNavigating: boolean
  setIsNavigating: (v: boolean) => void
  navigatingTo: string | null
  setNavigatingTo: (v: string | null) => void
}

const AdminTabContext = createContext<AdminContextType | null>(null)

export function AdminProvider({
  children,
  initialTab = 'overview',
}: {
  children: React.ReactNode
  initialTab?: string
}) {
  const [activeTab, setActiveTabState] = useState(initialTab)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  // Listen to popstate (browser back/forward) and initialize from URL search param on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') || initialTab
      setActiveTabState(tab)
    }

    updateFromUrl()
    window.addEventListener('popstate', updateFromUrl)
    return () => window.removeEventListener('popstate', updateFromUrl)
  }, [initialTab])

  const setActiveTab = (tab: string) => {
    if (tab === activeTab) return
    setActiveTabState(tab)
    setIsNavigating(true)
    setNavigatingTo(tab)

    // Smoothly update browser URL without full server-re-render lag
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/admin?tab=${tab}`)
    }

    // Micro-transition feedback for tactile responsiveness
    const timer = setTimeout(() => {
      setIsNavigating(false)
      setNavigatingTo(null)
    }, 280)

    return () => clearTimeout(timer)
  }

  return (
    <AdminTabContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isNavigating,
        setIsNavigating,
        navigatingTo,
        setNavigatingTo,
      }}
    >
      {children}
    </AdminTabContext.Provider>
  )
}

export function useAdminTab() {
  const ctx = useContext(AdminTabContext)
  return ctx
}
