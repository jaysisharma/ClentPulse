// Class vocabulary shared by the landing sections. Light paper page, ink type,
// near-black "ember" panels (see `.ember` in globals.css). Tokens per DESIGN.md.

export const page = 'theme-light bg-canvas text-ink'

export const card = 'rounded-[20px] border border-line bg-surface text-ink'

export const well = 'rounded-xl border border-line bg-sunken text-ink'

export const muted = 'text-ink-muted'

export const heading = 'text-balance font-light tracking-[-0.03em] text-ink'

/** Plain label above a section title. */
export const eyebrow = 'text-sm text-ink-muted'

/** Dark panel with the violet/ember glow. Pair with white text. */
export const ember = 'ember relative isolate overflow-hidden rounded-[20px] text-white'

const focus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export const primaryBtn = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-canvas transition-colors hover:bg-ink/85 active:scale-[0.99] ${focus}`

export const secondaryBtn = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 text-sm font-medium text-ink transition-colors hover:bg-sunken ${focus}`

/** White pill for use on an ember panel. */
export const lightBtn =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-ink transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black'

export const textLink =
  'inline-flex min-h-11 items-center gap-1.5 text-sm text-ink underline-offset-4 transition-colors hover:underline'

export const section = 'mx-auto max-w-6xl px-5 sm:px-8'
