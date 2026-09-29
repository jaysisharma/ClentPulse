<div align="center">

# Frevio

**The Client Portal & Financial Defense Engine for Modern Freelancers and Studios.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-635bff?style=flat&logo=stripe)](https://stripe.com/)
[![Vitest](https://img.shields.io/badge/Tests-188%20Passing-green?style=flat&logo=vitest)](https://vitest.dev/)

[Features](#-key-features) • [Architecture](#-architecture--tech-stack) • [VS Code Extension](#-vs-code-extension) • [Quick Start](#-quick-start) • [Database Migrations](#-database-migrations) • [Testing](#-testing)

</div>

---

## 💡 Why Frevio?

Most freelance tools are either bloated project management software (Asana, Monday, Basecamp) or rigid invoicing software (HoneyBook, Bonsai). 

**Frevio bridges the emotional gap in client services:**
1. **Eliminates Client Anxiety:** Clients get a dedicated private portal (`/p/[slug]`) with live telemetry showing when you're actively working on their project.
2. **Protects Cash Flow:** Unlocks deliverables only after upfront kickoff deposits (25%, 33%, 50%) are settled via Stripe.
3. **Stops Client Ghosting:** Flag projects as *"Waiting on Client"* with 1-click branded nudges that itemize exact blockers (assets, API keys, sign-offs).
4. **Turns Clients into Promoters:** White-label portals, custom CNAME domains (`status.youragency.com`), and rich deliverable previews (Figma, GitHub PRs, Staging URLs).

---

## ✨ Key Features

### 🟢 1. Live Developer Telemetry & Presence
- **VS Code & Antigravity Extension:** Automatically syncs editor focus areas (`"Frontend & UI"`, `"Backend"`, `"Testing"`) without transmitting code, keystrokes, or file contents.
- **Client Viewing Indicator:** Real-time Supabase presence channel alerts you when a client is inspecting their portal.
- **Smart Idle Protection:** Automatic pause after 5 minutes of inactivity to prevent ghost time logging.

### 💰 2. Financial Defense & Invoicing Engine
- **Upfront Kickoff Deposits:** Configure 25%, 33%, or 50% deposit gates before project status unlocks.
- **Multi-Currency Support:** Full itemized invoicing in `USD ($)`, `EUR (€)`, `GBP (£)`, `CAD (CA$)`, and `AUD (A$)`.
- **Tax / VAT Compliance:** Itemized Tax/VAT rates and Freelancer Tax IDs (EIN, VAT, GST, ABN) rendered on print-ready invoices.
- **Hardened Stripe Webhooks:** Idempotency deduplication (`processed_stripe_events`), event ordering timestamps (`stripe_event_created_at`), smart retry dunning deduplication, and fallback user linkage.

### 🏢 3. Multi-Seat Agency Workspaces & RBAC
- **Organizations & Workspaces:** Seamlessly switch between personal freelancer studios and multi-member agencies.
- **Staffed Project Pods:** Assign team specialists with custom titles (*Lead Architect*, *UI/UX Designer*) showcased on client portals.
- **Role-Based Access Control:** Separate owner/admin financial controls from specialist milestone and deliverable views.
- **Internal Notes vs. Client Broadcasts:** Post internal team notes hidden from the public client portal with RLS database safeguards.

### 🌐 4. Agency White-Labeling & Custom Domains
- **CNAME Hostname Routing:** Custom domains (e.g., `status.youragency.com`) routed dynamically via Next.js Edge proxy rewrites in `src/proxy.ts`.
- **100% White-Label:** Custom logos, favicons, custom hex accent themes, and removal of all platform branding.

### 🎯 5. Modular Craft Personas
- **Adaptive Workspace Modules:** One-click presets configured in `/settings` or `/onboarding`:
  - 💻 **Developer:** Telemetry, GitHub PR embeds, and technical deliverable previews.
  - 📈 **Digital Marketer:** Custom KPI strips (*Ad Spend*, *ROAS*, *CPA*), Looker Studio / Google Sheets embeds.
  - 🎨 **Designer:** Figma prototypes, visual approvals, revision requests.
  - 💼 **Consultant:** Contracts, legal e-signatures, advisory briefs.

---

## 🏛️ Architecture & Tech Stack

```
frevio/
├── src/
│   ├── app/                      # Next.js 16 App Router (66+ routes)
│   │   ├── (auth)/               # Supabase Auth, login, reset-password, OTP
│   │   ├── api/                  # Secure REST API routes & webhook handlers
│   │   ├── dashboard/            # Freelancer & agency executive command centers
│   │   ├── p/[slug]/             # High-performance client status portal
│   │   ├── project/[id]/         # Project management, staffing, milestones
│   │   └── settings/             # Modules, white-labeling, tokens, team seats
│   ├── components/               # React 19 UI components & design system
│   │   ├── landing/              # GSAP-powered obsidian luxury landing page
│   │   └── ui/                   # Shared design system primitives
│   ├── lib/                      # Core business logic, Supabase SSR, Stripe
│   │   ├── plans.ts              # Tier definitions (free, pro, agency)
│   │   ├── modules.ts            # Persona module flags and resolvers
│   │   └── currencies.ts         # Multi-currency formatting & math
│   └── proxy.ts                  # Edge middleware for custom CNAME domain rewrites
├── extension/                    # Official VS Code & Antigravity IDE extension
└── deploy/                       # Modular PostgreSQL Supabase migrations
```

- **Framework:** Next.js 16 (App Router, React Server Components, Server Actions)
- **UI Library:** React 19 + Tailwind CSS v4 + Radix UI Primitives + Lucide Icons
- **Animation:** GSAP 3 (Cinematic scroll-triggered landing page animations)
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security, SSR auth, Realtime channels)
- **Billing:** Stripe (Checkout, Customer Portal, Webhooks, Multi-currency)
- **Email Delivery:** Resend
- **Test Runner:** Vitest (188 tests across 35 test suites)

---

## 🔌 VS Code Extension

The extension synchronizes active workspace coding heartbeats to Frevio:

```bash
cd extension
npm install
npm run build
```

To install locally in VS Code or Antigravity:
1. Generate a token in **Settings > Editor Extension** (`frev_live_...`).
2. Run `Cmd+Shift+P` -> `Frevio: Set API Token`.
3. In your client project workspace, run `Cmd+Shift+P` -> `Frevio: Link Workspace to Project`.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/frevio.git
cd frevio
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your credentials:
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Stripe:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Resend:** `RESEND_API_KEY`
- **Integrations:** `INTEGRATION_ENCRYPTION_KEY` (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### 3. Run Database Migrations

Apply the migration scripts in your **Supabase SQL Editor** in numerical order:
1. `supabase-schema.sql` — Core database tables & initial RLS policies.
2. `deploy/agency-full-suite-migration.sql` — Multi-tenant organizations, pods, white-labeling, and audit logs.
3. `deploy/marketing-freelancer-suite-migration.sql` — Marketing deliverables, KPI snapshots, and video embeds.
4. `deploy/persona-modules-migration.sql` — Modular feature flags and craft personas.
5. `deploy/stripe-hardening-migration.sql` — Webhook idempotency and event ordering tables.

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

Frevio maintains a strict testing suite with comprehensive unit and integration coverage across billing, security, RBAC, and client portal operations.

```bash
# Run all 188 tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📦 Production Deployment

### Vercel (Recommended)
1. Import your Git repository into Vercel.
2. Add all environment variables from `.env.local`.
3. Deploy. Edge rewrites in `src/proxy.ts` will handle custom CNAME routing automatically.

### AWS EC2 / Self-Hosted
See [DEPLOY-EC2.md](DEPLOY-EC2.md) for full instructions on running Frevio with PM2, Node.js, and Caddy reverse proxy with automatic SSL certificates.

---

## 📄 License
Private & Proprietary. All rights reserved.
