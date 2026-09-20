'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Activity,
  Users,
  Mail,
  Eye,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
  ArrowLeft,
  Megaphone,
  CreditCard,
  Send,
  Zap,
  BarChart2,
  DollarSign,
  Gauge,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/theme-provider'

interface AdminShellProps {
  children: React.ReactNode
  user?: { name: string | null; plan: string }
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
        active
          ? 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 dark:border-rose-500/20 shadow-xs'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
      )}
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500")} />
      <span>{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
    </Link>
  )
}

export function AdminShell({ children, user }: AdminShellProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const currentTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth/login')
  }

  const adminNavGroups = [
    {
      title: 'Dashboard',
      items: [
        { tab: 'overview',  label: 'Overview',       icon: Activity,      href: '/admin?tab=overview' },
        { tab: 'feed',      label: 'Realtime Feed',  icon: Zap,           href: '/admin?tab=feed' },
      ]
    },
    {
      title: 'Users',
      items: [
        { tab: 'users',     label: 'User Directory', icon: Users,        href: '/admin?tab=users' },
        { tab: 'cohorts',   label: 'Cohorts',        icon: BarChart2,    href: '/admin?tab=cohorts' },
      ]
    },
    {
      title: 'Growth',
      items: [
        { tab: 'funnel',    label: 'Product Funnel', icon: BarChart2,    href: '/admin?tab=funnel' },
        { tab: 'marketing', label: 'Campaigns & UTMs', icon: Megaphone,  href: '/admin?tab=marketing' },
      ]
    },
    {
      title: 'Revenue',
      items: [
        { tab: 'revenue',   label: 'Subscriptions',  icon: DollarSign,   href: '/admin?tab=revenue' },
      ]
    },
    {
      title: 'Product',
      items: [
        { tab: 'product',   label: 'Feature Usage',  icon: Gauge,        href: '/admin?tab=product' },
      ]
    },
    {
      title: 'Support',
      items: [
        { tab: 'feedback',  label: 'Feedback Center', icon: MessageSquare, href: '/admin?tab=feedback' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { tab: 'broadcast', label: 'Announcements',  icon: Send,         href: '/admin?tab=broadcast' },
        { tab: 'actions',   label: 'Admin Actions',  icon: ShieldAlert,  href: '/admin?tab=actions' },
      ]
    }
  ]

  const sidebarContent = (
    <aside className="w-60 min-h-screen bg-white dark:bg-[#07080a] border-r border-slate-200 dark:border-white/10 flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-sm dark:shadow-2xl transition-colors">
      {/* Admin Logo Header */}
      <div className="px-5 h-16 flex items-center justify-between flex-shrink-0 border-b border-slate-200 dark:border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-900 dark:text-white font-semibold text-sm tracking-tight block">Frevio</span>
            <span className="text-[9px] text-rose-600 dark:text-rose-400 font-mono uppercase tracking-wider block font-medium">Admin Studio</span>
          </div>
        </Link>
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Admin mode active" />
      </div>

      {/* Admin Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
        {adminNavGroups.map(group => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 mb-1">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{group.title}</span>
            </div>
            {group.items.map(item => (
              <NavLink
                key={item.tab}
                active={currentTab === item.tab}
                onNavigate={() => setOpen(false)}
                {...item}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Admin Actions */}
      <div className="px-3 py-3 border-t border-slate-200 dark:border-white/10 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors w-full text-left"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          Back to Workspace
        </Link>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors w-full text-left cursor-pointer"
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
          {mounted && theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-slate-100">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 print:hidden",
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent}
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-20 print:hidden border-b bg-white dark:bg-[#07080a] border-slate-200 dark:border-white/10">
        <button
          onClick={() => setOpen(o => !o)}
          className="p-2 rounded-xl transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-sm text-slate-900 dark:text-white">Frevio Admin</span>
        </div>
        <div className="w-9 h-9" /* Spacer */ />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-60 p-6 lg:p-8 pt-20 lg:pt-8 print:ml-0 print:p-0">
        {children}
      </main>
    </div>
  )
}
