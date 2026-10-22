# Frevio — Design Basis

The shared visual language for the app. New UI should follow this so the product
stays consistent by default instead of drifting per-page.

## Palette — "Ink & Violet"

Monochrome first: near-black and white do the work, violet is a detail color
(links, ticks, progress, focus), never the main button on the marketing page.
Defined in [`globals.css`](src/app/globals.css) as CSS variables exposed through
`@theme inline`. **Use the token utility, never a raw hex or Tailwind palette
literal.** Tokens switch automatically under `html.dark` / `.theme-dark`, so a
token class needs no `dark:` twin.

### Surfaces & text

| Token | Utility | Light | Dark | Use for |
|---|---|---|---|---|
| canvas | `bg-canvas` | `#F8F6F1` | `#0B0B0C` | page background |
| surface | `bg-surface` | `#FFFFFF` | `#17171A` | cards, nav, popovers |
| sunken | `bg-sunken` | `#F1EEE7` | `#111113` | wells; the landing "sheet" |
| line | `border-line` | `#E8E4DC` | `white/8%` | dividers — decorative only |
| line-strong | `border-line-strong` | `#8C877C` | `#6B6B70` | input / checkbox borders (≥3:1) |
| ink | `text-ink` | `#171717` | `#F5F5F4` | primary text; primary pill buttons (`bg-ink text-canvas`) |
| ink-muted | `text-ink-muted` | `#6B6B65` | `#A1A1A0` | secondary text, second half of headings (≥4.5:1) |

### Brand accent

| Token | Utility | Light | Dark | Use for |
|---|---|---|---|---|
| accent | `bg-accent` `text-accent` | `#7C3AED` | `#A78BFA` | ticks, progress, badges, app primary buttons |
| accent-hover | `hover:bg-accent-hover` | `#6D28D9` | `#C4B5FD` | hover |
| on-accent | `text-on-accent` | `#FFFFFF` | `#0A0A0A` | text/icons **on** an accent fill |
| accent-strong | `text-accent-strong` `ring-accent-strong` | `#6D28D9` | `#A78BFA` | accent as text, links, focus rings |

### Status (state only — never a brand or action color)

| Token | Utility | Light | Dark | Use for |
|---|---|---|---|---|
| positive | `text-positive` | `#0E7A4E` | `#34D399` | paid, approved, growth |
| danger | `bg-danger text-on-danger` / `text-danger` | `#C2253D` | `#FB7185` | money owed, destructive |
| attention | `text-attention` | `#A16207` | `#FACC15` | pending, needs attention |

Tints use opacity (`bg-positive/10`).

### Scoping

`.theme-dark` pins a subtree to dark values (and `html:has(.theme-dark)` makes the
document chrome follow). `.theme-light` does the reverse.

## Type
Inter `font-sans`. Page titles `text-2xl font-bold text-ink`.
Eyebrow labels `text-xs font-bold uppercase tracking-wider text-ink-muted`.

## Surfaces & primitives
- **Card:** `bg-surface rounded-xl border border-line shadow-sm`, padding `p-5`.
- **[`StatCard`](src/components/ui/stat-card.tsx):** the canonical metric tile
  (label / value / optional sub, `tone="danger"` to flag money owed). Use it for
  any overview metric — don't hand-roll stat tiles.
- **[`Button`](src/components/ui/button.tsx):** `primary` (violet) /
  `secondary` / `ghost` / `danger`, sizes `sm | md | lg`.
- **[`Logo`](src/components/ui/logo.tsx):** stem follows `currentColor`, bar is
  always violet. On an always-dark surface pass `text-white`.
- **Status badge:** positive / attention / ink-muted by state.

## Migration status
- ✅ Tokens, `Button`, `Logo`, favicon, theme-color.
- Marketing page (`/`, `src/components/landing/`) is light-only (`.theme-light`) on the tokens:
  paper canvas, light tight-tracked headlines, ink pill buttons, one flat ink `stage` behind the
  hero product shot. No gradients, no dark feature tiles; colour comes only from status states.
  Shared classes live in `src/components/landing/styles.ts`.
- ⏳ App (`/dashboard`, `/project`, `/settings`, portal) still uses raw `indigo-*`,
  `slate-*` and ad-hoc near-blacks (`#0c0d12`, `#08090a`, …). Migrate by mapping
  indigo → `accent`, slate text → `ink`/`ink-muted`, slate borders → `line`,
  near-blacks → `canvas`/`surface`/`sunken`. Don't add new raw literals.
- ⏳ Raster icons (`favicon.ico`, `apple-icon.png`, `public/android-chrome-*.png`,
  `public/logo.png`, `og-image.png`) still show the old gradient mark.
