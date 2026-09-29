# Frevio — Design Basis

The shared visual language for the app. New UI should follow this so the product
stays consistent by default instead of drifting per-page.

## Tokens (semantic, not literal)

Defined in [`globals.css`](src/app/globals.css) under `@theme`. **Use the intent
token, not the raw palette value**, so the brand accent is swappable in one place.

| Token | Utility | Value | Use for |
|---|---|---|---|
| accent | `bg-accent` `text-accent` `ring-accent` | indigo-600 | primary actions, links, active nav |
| accent-hover | `hover:bg-accent-hover` | indigo-700 | primary hover |
| positive | `text-positive` | emerald-600 | paid, growth, net profit |
| danger | `bg-danger` `text-danger` | rose-600 | money owed, destructive |
| attention | `text-attention` | amber-600 | pending / needs-attention |

Neutrals stay the Tailwind **`slate`** scale (text, surfaces, borders). Light
accent tints use opacity (`bg-accent/10`) rather than a separate `-50` literal.

## Type
System / Inter `font-sans`. Page titles `text-2xl font-bold text-slate-900`.
Eyebrow labels `text-xs font-bold uppercase tracking-wider`.

## Surfaces & primitives
- **Card:** `bg-white rounded-xl border border-slate-200 shadow-sm`, padding `p-5`.
- **[`StatCard`](src/components/ui/stat-card.tsx):** the canonical metric tile
  (label / value / optional sub, `tone="danger"` to flag money owed). Use it for
  any overview metric — don't hand-roll stat tiles.
- **[`Button`](src/components/ui/button.tsx):** `primary` (accent) / `secondary`
  / `ghost` / `danger`, sizes `sm | md | lg`.
- **Status badge:** emerald / amber / slate by state.
- **App chrome:** dark `slate-900` fixed sidebar + light `slate-50` canvas.

The dashboard ([`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx)) is the
reference implementation of all of the above.

## Theme & Canvas Architecture
- **Marketing (`/`)**: GSAP scroll-triggered luxury dark/light mode with alternating sections and ambient spotlight glow.
- **In-App Studio (`/dashboard`, `/project`, `/settings`)**: Full dark/light parity using `<DarkShell>` and `<AppLayout>`. In dark mode, uses deep obsidian `#08090a` canvas, `#0c0d12` surface cards, hairline glass borders (`border-white/10`), and monospace metrics. In light mode, uses crisp slate `#f8fafc` canvas, `#ffffff` cards, and `border-slate-200`.
- **Client Portal (`/p/[slug]` & `/demo`)**: Dual-mode rendering honoring user/agency preference and white-labeling accent colors.

## Semantic Tokens
All pages use semantic tokens and adaptive classes:
`bg-white dark:bg-[#0c0d12] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white`

