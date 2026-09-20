'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FolderOpen, Settings, LogOut,
  Archive, FileText, Clock, TrendingUp, Star,
  Globe, ScrollText, Users, Wallet, Moon, Sun, Shield,
  MessageSquare, Building2, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkAndSyncPromoPlan } from '@/lib/plans'
import { Logo } from '@/components/ui/logo'
import { useTheme } from '@/components/theme-provider'
import { WorkspaceSwitcher } from './workspace-switcher'
import { Workspace } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  tourId?: string
}

// Agency Navigation Structure
const agencyPrimaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
  { href: '/project',   label: 'Projects',  icon: FolderOpen },
  { href: '/clients',   label: 'Clients',   icon: Users },
  { href: '/invoices',  label: 'Invoices',  icon: FileText },
  { href: '/time',      label: 'Time Log',  icon: Clock },
]

const agencyManagementNav: NavItem[] = [
  { href: '/settings/team', label: 'Team',     icon: Building2, tourId: 'team' },
  { href: '/upgrade',       label: 'Billing',  icon: Sparkles },
  { href: '/settings',      label: 'Settings', icon: Settings },
]

// Freelancer Navigation Structure
const freelancerPrimaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
  { href: '/project',   label: 'Projects',  icon: FolderOpen },
  { href: '/clients',   label: 'Clients',   icon: Users },
  { href: '/invoices',  label: 'Invoices',  icon: FileText },
  { href: '/time',      label: 'Time Log',  icon: Clock },
]

const freelancerStudioNav: NavItem[] = [
  { href: '/earnings',     label: 'Earnings',     icon: TrendingUp },
  { href: '/expenses',     label: 'Expenses',     icon: Wallet },
  { href: '/portfolio',    label: 'Portfolio',    icon: Globe, tourId: 'portfolio' },
  { href: '/testimonials', label: 'Testimonials', icon: Star, tourId: 'testimonials' },
  { href: '/docs',         label: 'Documents',    icon: ScrollText },
]

const freelancerGeneralNav: NavItem[] = [
  { href: '/archive',  label: 'Archive',  icon: Archive },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onNavigate,
  tourId,
}: {
  href: string
  label: string
  icon: React.ElementType
  pathname: string
  onNavigate?: () => void
  tourId?: string
}) {
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      onClick={onNavigate}
      data-tour={tourId || label.toLowerCase()}
      className={cn(
        'group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
        active
          ? 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-950 dark:text-indigo-200 font-semibold border border-indigo-200/50 dark:border-indigo-500/20 shadow-2xs'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
      )}
    >
      <Icon className={cn(
        'w-4 h-4 flex-shrink-0 transition-colors',
        active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
      )} />
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
      )}
    </Link>
  )
}

export function Sidebar({
  onNavigate,
  user: userProp,
  onFeedbackOpen,
}: {
  onNavigate?: () => void
  user?: { name: string | null; plan: 'free' | 'pro' }
  onFeedbackOpen?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState<string | null>(userProp?.name ?? null)
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>(userProp?.plan ?? 'free')
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)

  const isAgency = activeWorkspace?.type === 'agency'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return

      supabase
        .from('users')
        .select('id, name, plan, is_admin, promo_pro, created_at')
        .eq('id', user.id)
        .maybeSingle()
        .then(async ({ data: profile }: { data: any }) => {
          if (profile) {
            const syncedPlan = await checkAndSyncPromoPlan(profile, supabase)
            if (!userProp) {
              setUserName(profile.name ?? null)
              setUserPlan(syncedPlan as 'free' | 'pro')
            }
            setIsAdmin(!!profile.is_admin)
          }
        })
    })
  }, [userProp])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-white dark:bg-[#07080a] border-r border-slate-200 dark:border-white/10 flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-sm dark:shadow-2xl transition-colors">

      {/* Header / Logo */}
      <div className="px-4 h-14 flex items-center justify-between flex-shrink-0 border-b border-slate-200 dark:border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Logo className="w-5 h-5 transition-transform group-hover:scale-105" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-900 dark:text-white font-semibold text-sm tracking-tight">Frevio</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
              {isAgency ? 'Agency' : 'Studio'}
            </span>
          </div>
        </Link>
        <span className="w-2 h-2 rounded-full bg-emerald-500" title="System online" />
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher onWorkspaceChange={setActiveWorkspace} />

      {/* Nav List */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">

        {/* Section 1: Main Workspace Operations */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          <div className="space-y-0.5">
            {(isAgency ? agencyPrimaryNav : freelancerPrimaryNav).map(item => (
              <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        {/* Section 2: Studio / Growth or Management */}
        {isAgency ? (
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Management
            </div>
            <div className="space-y-0.5">
              {agencyManagementNav.map(item => (
                <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Studio & Growth
            </div>
            <div className="space-y-0.5">
              {freelancerStudioNav.map(item => (
                <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: General / Preferences (Freelancer) */}
        {!isAgency && (
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Preferences
            </div>
            <div className="space-y-0.5">
              {freelancerGeneralNav.map(item => (
                <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        {/* Admin Section (Conditional) */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Administration
            </div>
            <div className="space-y-0.5">
              <NavLink href="/admin" label="Admin Panel" icon={Shield} pathname={pathname} onNavigate={onNavigate} />
            </div>
          </div>
        )}

        {/* Feedback Action */}
        {onFeedbackOpen && (
          <div className="pt-1">
            <button
              onClick={onFeedbackOpen}
              className="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all duration-150 w-full text-left cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0" />
              <span className="truncate">Feedback</span>
            </button>
          </div>
        )}

      </nav>

      {/* Streamlined Footer Profile Card */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#050608]/70 flex items-center justify-between gap-2">
        {userName ? (
          <Link
            href="/settings"
            onClick={onNavigate}
            title="Account Settings"
            className="flex items-center gap-2.5 min-w-0 flex-1 p-1 -ml-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-indigo-400/20 font-mono">
              {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {userName}
              </div>
              <div className={cn(
                'text-[10px] font-medium tracking-wide flex items-center gap-1',
                userPlan === 'pro' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
              )}>
                {userPlan === 'pro' ? '✦ Pro' : 'Free'}
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {/* Inline Theme & Signout Quick Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={toggleTheme}
            title={mounted && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  )
}
