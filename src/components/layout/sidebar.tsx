'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FolderOpen, Settings, LogOut,
  Archive, FileText, Clock, TrendingUp, Star,
  Globe, ScrollText, Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const primaryNav = [
  { href: '/dashboard',    label: 'Dashboard', icon: LayoutDashboard },
  { href: '/project',      label: 'Projects',  icon: FolderOpen      },
  { href: '/clients',      label: 'Clients',   icon: Users           },
  { href: '/invoices',     label: 'Invoices',  icon: FileText        },
  { href: '/time',         label: 'Time',      icon: Clock           },
  { href: '/earnings',     label: 'Earnings',  icon: TrendingUp      },
]

const secondaryNav = [
  { href: '/testimonials', label: 'Testimonials', icon: Star       },
  { href: '/portfolio',    label: 'Portfolio',    icon: Globe      },
  { href: '/docs',         label: 'Documents',    icon: ScrollText },
  { href: '/archive',      label: 'Archive',      icon: Archive    },
]

export function Sidebar({
  onNavigate,
  user: userProp,
}: {
  onNavigate?: () => void
  user?: { name: string | null; plan: 'free' | 'pro' }
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(userProp?.name ?? null)
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>(userProp?.plan ?? 'free')

  useEffect(() => {
    if (userProp) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('users').select('name, plan').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setUserName(data.name ?? null)
            setUserPlan(data.plan ?? 'free')
          }
        })
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth/login')
  }

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          active
            ? 'bg-slate-800 text-white'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {label}
      </Link>
    )
  }

  return (
    <aside className="w-60 min-h-screen bg-slate-900 flex flex-col fixed left-0 top-0 bottom-0 z-40">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <img src="/logo.png" alt="ClientPulse" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-white font-semibold text-lg">ClientPulse</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

        {/* Primary */}
        {primaryNav.map(item => <NavLink key={item.href} {...item} />)}

        {/* Divider */}
        <div className="pt-4 pb-1">
          <div className="px-3 mb-1">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">More</span>
          </div>
          {secondaryNav.map(item => <NavLink key={item.href} {...item} />)}
        </div>

      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
        {userName && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-200 truncate">{userName}</div>
              <div className={cn(
                'text-[10px] font-semibold',
                userPlan === 'pro' ? 'text-indigo-400' : 'text-slate-500'
              )}>
                {userPlan === 'pro' ? '✦ Pro' : 'Free plan'}
              </div>
            </div>
          </div>
        )}
        <NavLink href="/settings" label="Settings" icon={Settings} />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

    </aside>
  )
}
