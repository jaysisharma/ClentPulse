'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FolderOpen, Settings, LogOut,
  Archive, FileText, Clock, TrendingUp, Star,
  Globe, ScrollText, Users, Wallet, Moon, Sun, Shield, MessageSquare, Building2, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkAndSyncPromoPlan } from '@/lib/plans'
import { Logo } from '@/components/ui/logo'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { WorkspaceSwitcher } from './workspace-switcher'
import { Workspace } from '@/types'

const agencyPrimaryNav = [
  { href: '/dashboard',     label: 'Executive Radar',       icon: LayoutDashboard },
  { href: '/project',       label: 'Agency Projects',       icon: FolderOpen      },
  { href: '/settings/team', label: 'Team Pods & Seats',     icon: Building2       },
  { href: '/clients',       label: 'Client Accounts',       icon: Users           },
  { href: '/invoices',      label: 'Financials & Invoices', icon: FileText        },
  { href: '/time',          label: 'Team Time Log',         icon: Clock           },
]

const agencySecondaryNav = [
  { href: '/settings',      label: 'Agency Settings & Brand', icon: Settings },
  { href: '/upgrade',       label: 'Plans & Seats',           icon: Sparkles },
]

const freelancerPrimaryNav = [
  { href: '/dashboard',    label: 'Dashboard', icon: LayoutDashboard },
  { href: '/project',      label: 'Projects',  icon: FolderOpen      },
  { href: '/clients',      label: 'Clients',   icon: Users           },
  { href: '/invoices',     label: 'Invoices',  icon: FileText        },
  { href: '/time',         label: 'Time Log',  icon: Clock           },
  { href: '/earnings',     label: 'Earnings',  icon: TrendingUp      },
  { href: '/expenses',     label: 'Expenses',  icon: Wallet          },
]

const freelancerSecondaryNav = [
  { href: '/testimonials', label: 'Testimonials', icon: Star       },
  { href: '/portfolio',    label: 'Portfolio',    icon: Globe      },
  { href: '/docs',         label: 'Documents',    icon: ScrollText },
  { href: '/archive',      label: 'Archive',      icon: Archive    },
  { href: '/settings',     label: 'Settings',     icon: Settings   },
]

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ElementType
  pathname: string
  onNavigate?: () => void
}) {
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      onClick={onNavigate}
      data-tour={label.toLowerCase()}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
        active
          ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-semibold border border-slate-200/80 dark:border-white/10 shadow-xs'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
      )}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500')} />
      <span className="truncate">{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
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
  const currentPrimaryNav = isAgency ? agencyPrimaryNav : freelancerPrimaryNav
  const currentSecondaryNav = isAgency ? agencySecondaryNav : freelancerSecondaryNav

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return
      
      supabase.from('users').select('id, name, plan, is_admin, promo_pro, created_at').eq('id', user.id).maybeSingle()
        .then(async ({ data }: { data: any }) => {
          if (data) {
            const syncedPlan = await checkAndSyncPromoPlan(data, supabase)
            if (!userProp) {
              setUserName(data.name ?? null)
              setUserPlan(syncedPlan as 'free' | 'pro')
            }
            setIsAdmin(!!data.is_admin)
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

      {/* Logo Header */}
      <div className="px-5 h-16 flex items-center justify-between flex-shrink-0 border-b border-slate-200 dark:border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Logo className="w-6 h-6 transition-transform group-hover:scale-105" />
          <div>
            <span className="text-slate-900 dark:text-white font-semibold text-sm tracking-tight block">Frevio</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider block">
              {isAgency ? 'Agency OS' : 'Studio OS'}
            </span>
          </div>
        </Link>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System online" />
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher onWorkspaceChange={setActiveWorkspace} />

      {/* Nav list */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">

        {/* Primary Workspace */}
        <div className="px-3 mb-1.5 mt-1">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
            {isAgency ? 'Agency Operations' : 'Workspace'}
          </span>
        </div>
        {currentPrimaryNav.map(item => (
          <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
        ))}

        {/* Studio / Secondary */}
        <div className="pt-5 pb-1">
          <div className="px-3 mb-1.5">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
              {isAgency ? 'Management' : 'Studio'}
            </span>
          </div>
          {currentSecondaryNav.map(item => (
            <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
          ))}
          <button
            onClick={onFeedbackOpen}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors w-full text-left cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Give Feedback</span>
          </button>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="pt-4 pb-1">
            <div className="px-3 mb-1.5">
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.18em]">Administration</span>
            </div>
            <NavLink href="/admin" label="Admin Panel" icon={Shield} pathname={pathname} onNavigate={onNavigate} />
          </div>
        )}

      </nav>

      {/* User Card + Actions at Bottom */}
      <div className="px-3 py-3 border-t border-slate-200 dark:border-white/10 space-y-1 bg-slate-50/70 dark:bg-[#050608]">
        {userName && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 mb-1.5 shadow-2xs dark:shadow-none">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[11px] font-bold flex-shrink-0 border border-indigo-400/20 font-mono">
              {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userName}</div>
              <div className={cn(
                'text-[10px] font-medium tracking-wide',
                userPlan === 'pro' ? 'text-amber-600 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'
              )}>
                {userPlan === 'pro' ? '✦ Pro Plan' : 'Free Tier'}
              </div>
            </div>
          </div>
        )}

        <NavLink href="/settings" label="Settings" icon={Settings} pathname={pathname} onNavigate={onNavigate} />
        
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors w-full text-left cursor-pointer"
        >
          {mounted && theme === 'dark'
            ? <Sun className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            : <Moon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
          <span>{mounted && theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400/80 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors w-full text-left cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400/70" />
          <span>Sign out</span>
        </button>
      </div>

    </aside>
  )
}
