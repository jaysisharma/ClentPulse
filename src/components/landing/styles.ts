// Class vocabulary shared by the landing sections. Mirrors /auth/login so the
// marketing page and the sign-in flow read as one product (light + dark).

export const page = 'bg-slate-50 text-slate-900 dark:bg-[#08090a] dark:text-white'

export const card =
  'rounded-3xl border border-slate-200 bg-white ring-1 ring-slate-950/5 dark:border-white/10 dark:bg-[#0c0d12] dark:ring-white/5'

export const well = 'rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]'

export const muted = 'text-slate-500 dark:text-slate-400'

export const heading = 'text-balance font-light tracking-tight text-slate-900 dark:text-white'

export const eyebrow =
  'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/70 px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400'

const focus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-[#08090a]'

export const primaryBtn = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 ${focus}`

export const secondaryBtn = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 ${focus}`

export const section = 'mx-auto max-w-6xl px-4 sm:px-6'
