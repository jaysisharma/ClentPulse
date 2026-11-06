// Shared surface classes for the dashboard, matching the marketing site's app screenshots.
export const CARD =
  'rounded-md bg-white dark:bg-[#12141c] border border-[#eaecf2] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.02)]'

export const CARD_TITLE = 'text-sm font-bold text-slate-900 dark:text-white tracking-tight'

export const CARD_LINK =
  'text-xs font-semibold text-accent dark:text-indigo-400 hover:text-accent-hover dark:hover:text-indigo-300 inline-flex items-center gap-0.5'

export const ROW = 'flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors'

export type Tone = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet' | 'slate'

// Tinted icon tile + matching pill, one entry per tone.
export const TONES: Record<Tone, { tile: string; pill: string; stroke: string }> = {
  indigo: {
    tile: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50 text-accent dark:text-indigo-400',
    pill: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/40',
    stroke: '#4f46e5',
  },
  emerald: {
    tile: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    pill: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
    stroke: '#10b981',
  },
  rose: {
    tile: 'bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/50 text-rose-500 dark:text-rose-400',
    pill: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/40',
    stroke: '#f43f5e',
  },
  amber: {
    tile: 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400',
    pill: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
    stroke: '#f59e0b',
  },
  sky: {
    tile: 'bg-sky-50 dark:bg-sky-950/50 border-sky-100 dark:border-sky-900/50 text-sky-600 dark:text-sky-400',
    pill: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-800/40',
    stroke: '#0284c7',
  },
  violet: {
    tile: 'bg-violet-50 dark:bg-violet-950/50 border-violet-100 dark:border-violet-900/50 text-violet-600 dark:text-violet-400',
    pill: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800/40',
    stroke: '#7c3aed',
  },
  slate: {
    tile: 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400',
    pill: 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10',
    stroke: '#94a3b8',
  },
}
