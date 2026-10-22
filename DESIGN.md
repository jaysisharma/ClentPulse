# Frevio — Design Basis

The shared visual language for the app. New UI should follow this so the product
stays consistent by default instead of drifting per-page.

## Palette — "Ink & Ember"

One brand across marketing, app and client portal: warm linen surfaces, near-black
ink, and a single ember accent. Defined in [`globals.css`](src/app/globals.css)
as CSS variables exposed through `@theme inline`. **Use the token utility, never a
raw hex or Tailwind palette literal.** Tokens switch automatically under
`html.dark`, so a token class needs no `dark:` twin.

### Surfaces & text

| Token | Utility | Light | Dark | Use for |
|---|---|---|---|---|
| canvas | `bg-canvas` | `#F8F6F1` | `#0E0E0C` | page background |
| surface | `bg-surface` | `#FFFFFF` | `#161614` | cards, nav, popovers |
| sunken | `bg-sunken` | `#F1EEE7` | `#1F1F1C` | wells, table headers, hover rows |
| line | `border-line` | `#E8E4DC` | `white/10` | dividers — decorative only |
| line-strong | `border-line-strong` | `#8C877C` | `#6B6B67` | input / checkbox borders (≥3:1) |
| ink | `text-ink` | `#171717` | `#F5F5F3` | primary text |
| ink-muted | `text-ink-muted` | `#6B6B65` | `#A1A09A` | secondary text (≥4.5:1) |

### Brand accent

| Token | Utility | Light | Dark | Use for |
|---|---|---|---|---|
| accent | `bg-accent` | `#F4773B` | `#F4773B` | primary buttons, brand fills, highlights |
| accent-hover | `hover:bg-accent-hover` | `#E0662D` | `#F68A55` | primary hover |
| on-accent | `text-on-accent` | `#171717` | `#171717` | text/icons **on** an accent fill |
| accent-strong | `text-accent-strong` `ring-accent-strong` | `#C2410C` | `#F4773B` | accent as text, links, focus rings |

**Rule:** never put white text on ember — it is 2.78:1 and fails WCAG. Primary
buttons are `bg-accent text-on-accent` (6.4:1). Ember as text on a light surface
must be `text-accent-strong` (4.8:1).

### Status (state only — never a brand or action color)

| Token | Utility | Light | Dark | Use for |
|---|---|---|---|---|
| positive | `text-positive` | `#0E7A4E` | `#34D399` | paid, approved, growth |
| danger | `bg-danger text-on-danger` / `text-danger` | `#C2253D` | `#FB7185` | money owed, destructive |
| attention | `text-attention` | `#A16207` | `#FACC15` | pending, needs attention |

Attention is deliberately **yellow, not amber/orange**, so a pending badge can never
be mistaken for an ember action. Tints use opacity (`bg-positive/10`).

### Scoping

`.theme-light` pins a subtree to light values even when `html.dark` is set — the
marketing page (`/`) uses it because it has no dark design.

## Type
Inter `font-sans`. Page titles `text-2xl font-bold text-ink`.
Eyebrow labels `text-xs font-bold uppercase tracking-wider text-ink-muted`.

## Surfaces & primitives
- **Card:** `bg-surface rounded-xl border border-line shadow-sm`, padding `p-5`.
- **[`StatCard`](src/components/ui/stat-card.tsx):** the canonical metric tile
  (label / value / optional sub, `tone="danger"` to flag money owed). Use it for
  any overview metric — don't hand-roll stat tiles.
- **[`Button`](src/components/ui/button.tsx):** `primary` (ember, ink text) /
  `secondary` / `ghost` / `danger`, sizes `sm | md | lg`.
- **[`Logo`](src/components/ui/logo.tsx):** stem follows `currentColor`, bar is
  always ember. On an always-dark surface pass `text-white`.
- **Status badge:** positive / attention / ink-muted by state.

## Migration status
- ✅ Tokens, `Button`, `Logo`, favicon, theme-color, marketing page (`/`).
- ⏳ App (`/dashboard`, `/project`, `/settings`, portal) still uses raw `indigo-*`,
  `slate-*` and ad-hoc near-blacks (`#0c0d12`, `#08090a`, …). Migrate by mapping
  indigo → `accent`, slate text → `ink`/`ink-muted`, slate borders → `line`,
  near-blacks → `canvas`/`surface`/`sunken`. Don't add new raw literals.
- ⏳ Raster icons (`favicon.ico`, `apple-icon.png`, `public/android-chrome-*.png`,
  `public/logo.png`, `og-image.png`) still show the old gradient mark.
