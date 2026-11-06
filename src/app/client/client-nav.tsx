'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useClientUnread } from './use-client-unread'

export type ClientSection = 'home' | 'projects' | 'billing' | 'updates' | 'messages'

const SECTIONS: { key: ClientSection; label: string; href: string }[] = [
  { key: 'home', label: 'Home', href: '/client/dashboard' },
  { key: 'projects', label: 'Projects', href: '/client/projects' },
  { key: 'billing', label: 'Billing', href: '/client/billing' },
  { key: 'updates', label: 'Updates', href: '/client/updates' },
  { key: 'messages', label: 'Messages', href: '/client/messages' },
]

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="ml-1.5 min-w-[18px] px-1.5 rounded-full bg-[#111318] dark:bg-white text-white dark:text-[#111318] text-[11px] font-bold leading-[18px] text-center tabular-nums">
      {count}
      <span className="sr-only"> unread</span>
    </span>
  )
}

/** Header links on desktop, a bottom tab bar on phones. */
export function ClientNav({ active, projectIds }: { active: ClientSection; projectIds: string[] }) {
  const { total } = useClientUnread(projectIds)

  return (
    <>
      <nav aria-label="Client workspace" className="hidden sm:flex items-center gap-1 text-sm">
        {SECTIONS.map(s => (
          <Link
            key={s.key}
            href={s.href}
            aria-current={active === s.key ? 'page' : undefined}
            className={cn(
              'inline-flex items-center min-h-10 px-3 rounded-md transition-colors',
              active === s.key
                ? 'font-semibold text-[#111318] dark:text-white'
                : 'text-[#5A5F6B] dark:text-slate-400 hover:text-[#111318] dark:hover:text-white'
            )}
          >
            {s.label}
            {s.key === 'messages' && <UnreadBadge count={total} />}
          </Link>
        ))}
      </nav>

      <nav
        aria-label="Client workspace"
        className="sm:hidden fixed inset-x-0 bottom-0 z-30 h-16 grid grid-cols-5 border-t border-[#E7E7E3] dark:border-white/[0.08] bg-[#F7F7F5]/95 dark:bg-[#090a0f]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        {SECTIONS.map(s => (
          <Link
            key={s.key}
            href={s.href}
            aria-current={active === s.key ? 'page' : undefined}
            className={cn(
              'flex items-center justify-center text-xs',
              active === s.key ? 'font-bold text-[#111318] dark:text-white' : 'font-medium text-[#5A5F6B] dark:text-slate-400'
            )}
          >
            {s.label}
            {s.key === 'messages' && <UnreadBadge count={total} />}
          </Link>
        ))}
      </nav>
    </>
  )
}
