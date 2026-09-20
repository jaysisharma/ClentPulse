'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FolderOpen, Settings, LogOut,
  Archive, FileText, Clock, TrendingUp, Star,
  Globe, ScrollText, Users, Wallet, Moon, Sun, Shield,
  MessageSquare, Building2, Sparkles, ChevronRight
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

// ── Agency nav ────────────────────────────────────────────────────────────────
const agencyPrimaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
  { href: '/project',   label: 'Projects',  icon: FolderOpen },
  { href: '/clients',   label: 'Clients',   icon: Users },
  { href: '/invoices',  label: 'Invoices',  icon: FileText },
  { href: '/time',      label: 'Time Log',  icon: Clock },
]

const agencyMoreNav: NavItem[] = [
  { href: '/settings/team', label: 'Team',     icon: Building2, tourId: 'team' },
  { href: '/upgrade',       label: 'Billing',  icon: Sparkles },
  { href: '/settings',      label: 'Settings', icon: Settings },
]

// ── Freelancer nav ────────────────────────────────────────────────────────────
const freelancerPrimaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
  { href: '/project',   label: 'Projects',  icon: FolderOpen },
  { href: '/clients',   label: 'Clients',   icon: Users },
  { href: '/invoices',  label: 'Invoices',  icon: FileText },
  { href: '/time',      label: 'Time Log',  icon: Clock },
]

const freelancerMoreNav: NavItem[] = [
  { href: '/earnings',     label: 'Earnings',     icon: TrendingUp },
  { href: '/expenses',     label: 'Expenses',     icon: Wallet },
  { href: '/portfolio',    label: 'Portfolio',    icon: Globe, tourId: 'portfolio' },
  { href: '/testimonials', label: 'Testimonials', icon: Star, tourId: 'testimonials' },
  { href: '/docs',         label: 'Documents',    icon: ScrollText },
  { href: '/archive',      label: 'Archive',      icon: Archive },
  { href: '/settings',     label: 'Settings',     icon: Settings },
]

const MORE_HREFS_FREELANCER = freelancerMoreNav.map(i => i.href)
const MORE_HREFS_AGENCY     = agencyMoreNav.map(i => i.href)

// ── NavLink ────────────────────────────────────────────────────────────────────
function NavLink({
  href, label, icon: Icon, pathname, onNavigate, tourId,
}: {
  href: string; label: string; icon: React.ElementType
  pathname: string; onNavigate?: () => void; tourId?: string
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
        active
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
      )} />
      <span className="truncate">{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0" />}
    </Link>
  )
}

// ── MoreSection — the collapsible accordion ───────────────────────────────────
function MoreSection({
  items, pathname, onNavigate, moreHrefs,
}: {
  items: NavItem[]; pathname: string; onNavigate?: () => void; moreHrefs: string[]
}) {
  // Auto-expand if the user is already on a "More" page, else restore from localStorage
  const isMoreActive = moreHrefs.some(h => pathname === h || (h !== '/dashboard' && pathname.startsWith(h)))

  const [open, setOpen] = useState(() => {
    if (isMoreActive) return true
    if (typeof window === 'undefined') return false
    try { return localStorage.getItem('frevio-sidebar-more') === 'true' } catch { return false }
  })

  // Keep state in sync when pathname changes (e.g. user navigates to a "More" route)
  useEffect(() => {
    if (isMoreActive) setOpen(true)
  }, [isMoreActive])

  function toggle() {
    const next = !open
    setOpen(next)
    try { localStorage.setItem('frevio-sidebar-more', String(next)) } catch {}
  }

  return (
    <div>
      {/* Accordion trigger */}
      <button
        onClick={toggle}
        className={cn(
          'group w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer',
          isMoreActive && !open
            ? 'text-indigo-700 dark:text-indigo-300'
            : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
        )}
        aria-expanded={open}
      >
        {/* Animated chevron */}
        <ChevronRight
          className={cn(
            'w-4 h-4 flex-shrink-0 transition-transform duration-200 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300',
            open && 'rotate-90'
          )}
        />
        <span className="flex-1 text-left">More</span>
        {/* Dot hint when collapsed but a "More" page is active */}
        {isMoreActive && !open && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 flex-shrink-0" />
        )}
      </button>

      {/* Animated expand/collapse */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          open ? 'max-h-96 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
        )}
      >
        <div className="space-y-0.5 pl-3 border-l border-slate-200/80 dark:border-white/[0.07] ml-5 mt-1">
          {items.map(item => (
            <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
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

  useEffect(() => { setMounted(true) }, [])

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

      {/* ── Header ──────────────────────────────────────────────────────── */}
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

      {/* ── Workspace Switcher ───────────────────────────────────────────── */}
      <WorkspaceSwitcher onWorkspaceChange={setActiveWorkspace} />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">

        {/* Primary — always visible */}
        <div className="space-y-0.5 mb-1">
          {(isAgency ? agencyPrimaryNav : freelancerPrimaryNav).map(item => (
            <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Divider */}
        <div className="my-2 border-t border-slate-100 dark:border-white/[0.05]" />

        {/* More — expandable */}
        <MoreSection
          items={isAgency ? agencyMoreNav : freelancerMoreNav}
          pathname={pathname}
          onNavigate={onNavigate}
          moreHrefs={isAgency ? MORE_HREFS_AGENCY : MORE_HREFS_FREELANCER}
        />

        {/* Admin (conditional) */}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-indigo-100 dark:border-indigo-500/10" />
            <NavLink href="/admin" label="Admin Panel" icon={Shield} pathname={pathname} onNavigate={onNavigate} />
          </>
        )}

        {/* Feedback */}
        {onFeedbackOpen && (
          <div className="mt-2">
            <button
              onClick={onFeedbackOpen}
              className="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all duration-150 w-full text-left cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0" />
              <span className="truncate">Feedback</span>
            </button>
          </div>
        )}

      </nav>

      {/* ── Footer Profile Card ──────────────────────────────────────────── */}
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
                'text-[10px] font-medium',
                userPlan === 'pro' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
              )}>
                {userPlan === 'pro' ? '✦ Pro' : 'Free'}
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={toggleTheme}
            title={mounted && theme === 'dark' ? 'Light mode' : 'Dark mode'}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
