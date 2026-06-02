import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'active' | 'paused' | 'completed' | 'free' | 'pro'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'active', children, className }: BadgeProps) {
  const variants = {
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    paused: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    completed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    free: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    pro: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  }

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
