import { SignOutButton } from '@/components/ui/sign-out-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { ClientNav, type ClientSection } from './client-nav'
import { MUTED, RULE } from './client-ui'

/** Frame shared by every client workspace page: header, navigation, one reading column. */
export function ClientShell({
  active,
  email,
  projectIds,
  wide = false,
  children,
}: {
  active: ClientSection
  email: string
  projectIds: string[]
  /** Messages uses a two-pane layout and needs more room than the reading column. */
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#090a0f] text-[#111318] dark:text-slate-100 font-sans">
      <header className={cn('border-b', RULE)}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 min-h-[60px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-extrabold text-base tracking-[-0.02em]">Frevio</span>
            <span className={cn('hidden lg:inline text-sm truncate', MUTED)}>{email}</span>
          </div>
          <ClientNav active={active} projectIds={projectIds} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-28 sm:pb-20 flex flex-col gap-12',
          wide ? 'max-w-5xl' : 'max-w-[720px]'
        )}
      >
        {children}
      </main>
    </div>
  )
}
