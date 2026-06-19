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

## Known intentional split
- **Marketing (`/`)** is deliberately richer than the app: larger radii
  (`rounded-2xl/3xl`), gradients, glassmorphism, **and full dark mode**.
- **The app is light-only.** Dark mode is *not* yet wired through app components
  (they still use `bg-white` / `text-slate-900` directly). This is a known gap,
  not an oversight — migrating the app to dark is a dedicated effort. The CSS
  `dark` variant scaffolding already exists in `globals.css` for when we do.

## Migration note
Some pages still use raw `indigo-*` literals. Since `accent === indigo-600`,
they render identically — migrate them to tokens opportunistically; nothing
breaks in the meantime.
