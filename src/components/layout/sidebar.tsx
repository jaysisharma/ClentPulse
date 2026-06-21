'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FolderOpen, Settings, LogOut,
  Archive, FileText, Clock, TrendingUp, Star,
  Globe, ScrollText, Users, Wallet, Moon, Sun, Shield, MessageSquare,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkAndSyncPromoPlan } from '@/lib/plans'
import { Logo } from '@/components/ui/logo'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-provider'

const primaryNav = [
  { href: '/dashboard',    label: 'Dashboard', icon: LayoutDashboard },
  { href: '/project',      label: 'Projects',  icon: FolderOpen      },
  { href: '/clients',      label: 'Clients',   icon: Users           },
  { href: '/invoices',     label: 'Invoices',  icon: FileText        },
  { href: '/time',         label: 'Time',      icon: Clock           },
  { href: '/earnings',     label: 'Earnings',  icon: TrendingUp      },
  { href: '/expenses',     label: 'Expenses',  icon: Wallet          },
]

const secondaryNav = [
  { href: '/testimonials', label: 'Testimonials', icon: Star       },
  { href: '/portfolio',    label: 'Portfolio',    icon: Globe      },
  { href: '/docs',         label: 'Documents',    icon: ScrollText },
  { href: '/archive',      label: 'Archive',      icon: Archive    },
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
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-indigo-500/15 text-white font-semibold'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-indigo-400" : "text-slate-500")} />
      {label}
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

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const supabase = createClient()
    
    // We fetch user and profile regardless of userProp to determine admin status
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
    <aside className="w-60 min-h-screen bg-slate-900 border-r border-white/10 flex flex-col fixed left-0 top-0 bottom-0 z-40">

      {/* Logo */}
      <div className="px-5 h-16 flex items-center flex-shrink-0 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo className="w-7 h-7" />
          <div>
            <span className="text-white font-bold text-sm tracking-tight block">Frevio</span>
            <span className="text-[10px] text-slate-400 font-medium">Freelancer Hub</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">

        {/* Primary */}
        {primaryNav.map(item => (
          <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
        ))}

        {/* Divider */}
        <div className="pt-5 pb-1">
          <div className="px-3 mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">More</span>
          </div>
          {secondaryNav.map(item => (
            <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
          ))}
          <button
            onClick={onFeedbackOpen}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors w-full text-left cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            Feedback
          </button>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="pt-5 pb-1">
            <div className="px-3 mb-1.5">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Administration</span>
            </div>
            <NavLink href="/admin" label="Admin Panel" icon={Shield} pathname={pathname} onNavigate={onNavigate} />
          </div>
        )}

      </nav>

      {/* User + sign out */}
      <div className="px-3 py-3 border-t border-white/10 space-y-0.5">
        {userName && (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px] font-bold flex-shrink-0 border border-indigo-400/20">
              {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white truncate">{userName}</div>
              <div className={cn(
                'text-[11px] font-semibold',
                userPlan === 'pro' ? 'text-indigo-400' : 'text-slate-500'
              )}>
                {userPlan === 'pro' ? '✦ Pro' : 'Free plan'}
              </div>
            </div>
          </div>
        )}
        <NavLink href="/settings" label="Settings" icon={Settings} pathname={pathname} onNavigate={onNavigate} />
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors w-full text-left cursor-pointer"
        >
          {mounted && theme === 'dark'
            ? <Sun className="w-4 h-4 text-slate-500" />
            : <Moon className="w-4 h-4 text-slate-500" />}
          {mounted && theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          Sign out
        </button>
      </div>

    </aside>
  )
}
