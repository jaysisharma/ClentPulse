# Frevio — Product Tracker & Roadmap

> **Current Version:** v0.3.0 (Agency & Studio Multi-Tenancy Complete!)  
> **Next Milestone:** v0.4.0 (Enterprise Client Portal & Client Direct Messaging)  
> **Last Updated:** September 2026

---

## 📊 High-Level Status Dashboard

| Track | Status | Progress |
| :--- | :--- | :--- |
| **Solo Freelancer Core Engine** | ✅ **Complete** | 100% Shipped |
| **Invoicing, Multi-Currency & Deposits** | ✅ **Complete** | 100% Shipped |
| **Client Status Portal & Approvals** | ✅ **Complete** | 100% Shipped |
| **Developer Telemetry (VS Code)** | ✅ **Complete** | 100% Shipped |
| **Overads Design System & GSAP Landing Page** | ✅ **Complete** | 100% Shipped |
| **Agency Multi-Tenancy & Workspaces** | ✅ **Complete** | 100% Shipped (Phase 1) |
| **Role-Based Access Control & Team Pods** | ✅ **Complete** | 100% Shipped (Phase 2) |
| **Agency White-Labeling & Custom Domains** | ✅ **Complete** | 100% Shipped (Phase 3) |
| **Internal Collaboration & Review Workflow** | ✅ **Complete** | 100% Shipped (Phase 4) |
| **Executive Radar & Capacity Analytics** | ✅ **Complete** | 100% Shipped (Phase 5) |

---

## ✅ WHAT HAS BEEN BUILT (Shipped Features)

### 1. Brand Identity & Design System
- [x] **Brand Rebrand**: Renamed from ClientPulse to **Frevio** across UI, metadata, legal terms, and notifications.
- [x] **Dark Luxury Aesthetic (Overads-style)**: Deep obsidian canvas (`#08090a`, `#0c0d12`), hairline glass borders (`border-white/10`), monospace metrics, and ambient glow accents.
- [x] **GSAP Cinematic Landing Page**: Smooth scroll-triggered entrance animations, animated terminal command bar, floating glass pill navbar, and interactive live demo screen switchers.
- [x] **Dual-Mode Dark/Light Theme**: Studio pages and client status portals render cleanly across dark and light environments.

### 2. Authentication & Account Security
- [x] **Supabase Auth**: Email/password sign-in and Google OAuth.
- [x] **Forgot Password & OTP Recovery**: 6-digit numeric OTP generation, verification endpoint, password reset form, and email delivery.
- [x] **Onboarding Flow**: 3-step setup guide for new freelancers (studio name, first client project, shareable link).

### 3. Project Management & Health Signals
- [x] **Project Workspace**: Projects list, project detail dashboard, budget tracking, color personalization.
- [x] **Attention Strip**: Dynamic health warnings for projects inactive for >7 days, pending approvals, and unsigned contracts.
- [x] **Kickoff Checklists & Milestones**: Interactive deliverable checklists with progress bars.
- [x] **Project Archive & Duplication**: Archive completed projects or duplicate project templates.

### 4. Live Developer Telemetry
- [x] **VS Code Extension**: Direct token-based heartbeat synchronization from the developer's IDE.
- [x] **Live Presence Badge**: Displays active coding state and current focus area to clients in real-time.
- [x] **Client Viewing Indicator**: Real-time Supabase channel notifying the developer when the client is currently viewing their portal.

### 5. Invoicing, Multi-Currency & Upfront Deposits
- [x] **Multi-Currency Engine**: Full support for `USD ($)`, `EUR (€)`, `GBP (£)`, `CAD (CA$)`, and `AUD (A$)`.
- [x] **Tax / VAT Compliance**: Itemized Tax/VAT rates (%) and Freelancer Tax ID (EIN, VAT, GST, ABN) on invoices and PDF prints.
- [x] **Upfront Kickoff Deposits**:
  - Deposit checkbox toggle with 1-click presets (**50%**, **33%**, **25%** of budget).
  - Synchronized `projects.deposit_required` and `projects.deposit_paid`.
- [x] **Client Portal Settlement Gate**: Client status page displays an upfront payment gate until the deposit invoice is paid.
- [x] **Stripe Checkout & Webhook Settlement**:
  - Lowercase multi-currency sessions in Stripe Checkout.
  - Webhook unlocks project (`deposit_paid = true`) and activates status automatically upon payment.

### 6. Client Blocker Management & 1-Click Nudge
- [x] **"Waiting on Client" Toggle**: Studio lead can flag projects as blocked on client response or assets.
- [x] **Blocker Reason Presets**: Quick tags (*Awaiting brand assets*, *Waiting on API keys*, *Awaiting DNS access*, *Milestone review*).
- [x] **Client Portal Notice**: Prominent amber banner on client status page showing exact blocker reason.
- [x] **1-Click Client Nudge**: Sends a polished, branded email via Resend directly to the client with portal link and action items.

### 7. Approvals & Rich Deliverable Previews
- [x] **Deliverable Types**: Supports `staging` (Live URL), `figma` (Design Prototype), `code_pr` (GitHub PR), `document` (Spec), and `asset_zip` (Exported Assets).
- [x] **Interactive Client Approval Card**: Clients can click prominent preview buttons to inspect deliverables before approving or requesting revisions.
- [x] **Approval Status Badges**: Real-time status tags (`Pending`, `Approved`, `Changes Requested`).

### 8. Legal Contracts & E-Signatures
- [x] **Contract Builder**: Fixed fee or retainer scope agreements with customizable terms.
- [x] **Public Signing Page**: Legal checkbox agreement, typed signature capture, and instant counter-sign confirmation.

### 9. Organizations & Multi-Seat Workspaces (Phase 1 Shipped)
- [x] **Database Schema**:
  - `organizations` table (`id`, `name`, `slug`, `logo_url`, `billing_plan`, `custom_domain`, `created_at`).
  - `organization_members` table (`id`, `org_id`, `user_id`, `role`, `joined_at`).
  - Link `projects.org_id` (with backward compatibility fallback to `user_id` for solo freelancers).
- [x] **Workspace Switcher**: Top-left dropdown allowing founders to switch between personal studio and agency organizations.
- [x] **Team Member Invites**: Invite PMs, developers, and designers via email with secure tokenized accept links.
- [x] **Team Management Page**: `/settings/team` command center to manage agency profile, team seats, and invitations.
- [x] **Public Acceptance Landing Page**: `/invite/[token]` with 1-click workspace join flow.
- [x] **Workspace Project Scoping**: Auto-assigning `org_id` on project creation and filtering `/project` views by active workspace.

### 10. Role-Based Access Control & Staffed Team Pods (Phase 2 Shipped)
- [x] **Database Schema**:
  - `project_team_members` table (`id`, `project_id`, `user_id`, `role_title`, `created_at`).
  - Row Level Security (RLS) policies for owner/admin management and public portal viewing.
- [x] **Internal RBAC Safeguards**:
  - `Owner` / `Admin`: Full access to budget, invoices, payouts, and team assignments.
  - `Member / Specialist`: Restricted from viewing financials (budget/invoicing masked); can manage milestones, deliverables, and log time.
- [x] **Project Team Pod Staffing UI**:
  - Interactive sidebar section in `/project/[id]` allowing agency admins to assign specialists and custom specialty titles (e.g., "Lead Frontend Architect", "UI/UX Specialist").
- [x] **Client Portal Pod Showcase**:
  - Shows agency branding in header and hero.
  - "Dedicated Staffed Pod" card showing assigned specialists, avatars, specialty roles, and real-time live editor pulse dots.
- [x] **Comprehensive Testing**:
  - 83/83 unit and integration tests passing in Vitest.
  - Clean Next.js production build across 66 routes with zero TypeScript errors.

---

## 🚀 WHAT WE HAVE TO BUILD NEXT (Agency & Company SaaS Evolution)

### 11. Agency White-Labeling & Custom Domains (Phase 3 Shipped)
- [x] **Database Schema**:
  - Columns added to `organizations`: `custom_domain`, `white_label`, `favicon_url`.
  - Unique index on `organizations(custom_domain)`.
- [x] **Agency Brand Customization**:
  - Logo URL & Favicon URL inputs with live visual previews.
  - Interactive Brand Accent Color Picker with 6 luxury studio presets (*Electric Indigo, Emerald, Cyber Violet, Amber Gold, Crimson Red, Minimal Slate*) and custom hex code input.
  - Accent colors dynamically theme all client-facing portal buttons, milestone badges, and live pulse dots.
- [x] **100% White-Label Portal Mode**:
  - Toggle switch to remove all "Powered by Frevio" branding and footer badges.
  - Dynamic page metadata: white-labeled title `${project.project_name} — Client Portal | ${org.name}` and custom browser favicon.
- [x] **Custom Domain & CNAME Hostname Routing**:
  - Input field for custom domain (e.g. `status.youragency.com`) with format validation and reserved domain protections.
  - Next.js Edge proxy rewrite mapping custom hostnames directly to `/p/[slug]` with `x-custom-domain` header propagation.
  - Interactive DNS CNAME instruction panel (`Type: CNAME`, `Host: status`, `Value: cname.frevio.app`) with 1-click copy.
  - Diagnostic DNS verification endpoint (`/api/organizations/[id]/domain-verify`) with live propagation check badge and test link.
- [x] **Testing & Build Verification**:
  - 89/89 unit and integration tests passing in Vitest across 16 test suites.
  - Clean Next.js Turbopack production build with 66 routes.

---

### 12. Internal Collaboration & Review Workflow (Phase 4 Shipped)
- [x] **Database Schema**:
  - Columns added to `updates`: `author_id`, `review_status` ('draft', 'review_ready', 'approved', 'published'), `approved_by`, `approved_at`.
  - Columns added to `update_comments`: `is_internal`, `user_id`.
  - New table `activity_logs`: `id`, `org_id`, `project_id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`.
  - Row Level Security (RLS) policies protecting internal notes from public client portal queries.
- [x] **Internal Notes vs. Client Broadcasts**:
  - Agency team members can post internal notes (`is_internal: true`) on update threads.
  - Public client status portal explicitly excludes internal notes (`is_internal: false`) at database query level.
  - Internal notes display distinct `🔒 Internal Note` indigo badge in studio update threads.
- [x] **Update Staging & Draft PM Review**:
  - Agency specialists write bullets and submit for review (`review_status: 'review_ready'`).
  - Project page surfaces attention alerts for pending PM reviews (`Awaiting PM Review`).
  - Agency PMs/Owners can 1-click approve drafts (`/api/projects/[id]/updates/[updateId]/review`).
  - Direct send / client broadcast permissions restricted to agency owners/admins.
- [x] **Activity Audit Trail**:
  - Global `logAgencyActivity` helper tracks published updates, review submissions, approvals, internal notes, and member invites.
  - Activity endpoint `/api/organizations/[id]/activity` with role-based security.
  - Chronological timeline widget in `/settings/team` showing agency events with actor avatars and project tags.
- [x] **Testing & Verification**:
  - 95/95 tests passing in Vitest across 18 test suites.
  - Clean Next.js Turbopack production build with 66 routes.

### 13. Agency Executive Radar & Financial Pipeline (Phase 5 Shipped)
- [x] **Database Schema & Index Optimizations**:
  - Migration script [`deploy/agency-executive-radar-migration.sql`](file:///Users/jaysisharma/Desktop/clientpulse/deploy/agency-executive-radar-migration.sql).
  - High-performance composite indexes on `projects(org_id, status)`, `projects(org_id, waiting_on_client)`, `invoices(project_id, status)`, `time_entries(project_id, date)`, and `project_team_members(project_id, user_id)`.
- [x] **Executive Command Center**:
  - Live at `/dashboard` when an agency workspace is active.
  - KPI Strip: Active projects, at-risk accounts, total blocked cash pipeline ($), and team hours logged.
- [x] **At-Risk Radar**:
  - Real-time detection of accounts with no client update sent in >7 days, projects blocked on client assets, and update drafts awaiting PM review.
  - 1-click "Send Update" shortcut directly to the update editor.
- [x] **Blocked Cash Radar**:
  - Aggregates held-up revenue across unpaid kickoff deposits (`deposit_required && !deposit_paid`) and unpaid invoices on projects flagged with `waiting_on_client = true`.
  - Itemized breakdown with 1-click "Manage Blocker" actions.
- [x] **Team Workload & Capacity Matrix**:
  - Visual matrix of all agency specialists with avatars, agency roles, and staffed project chips.
  - Weekly hours logged telemetry.
  - Real-time pulse dot from VS Code telemetry (`Coding in auth/route.ts` vs `Idle`).
  - Dynamic capacity gauges: `● Available` (0-1 projects, <15 hrs), `● Optimal` (2-3 projects, 15-35 hrs), `● At Capacity` (4+ projects or >35 hrs).
- [x] **Multi-Tier Monetization & Pricing**:
  - Tier Switcher on `/upgrade` supporting **Solo Freelancer** ($15/mo), **Agency Starter** ($89/mo, 5 seats), and **Agency Scale** ($249/mo, 25 seats + custom CNAME + radar).
  - Stripe Checkout support for agency plan subscriptions with `org_id` metadata.
- [x] **Comprehensive Testing & Build**:
  - 98/98 unit & integration tests passing in Vitest across 19 test suites.
  - Clean Next.js Turbopack production build with 66 routes.

---

## 📌 Supabase Deployment Instructions
Apply the complete agency suite migrations in your Supabase SQL Editor:
1. [`deploy/agency-organizations-migration.sql`](file:///Users/jaysisharma/Desktop/clientpulse/deploy/agency-organizations-migration.sql) — Multi-tenant schema
2. [`deploy/agency-team-pods-migration.sql`](file:///Users/jaysisharma/Desktop/clientpulse/deploy/agency-team-pods-migration.sql) — Staffed pods & RBAC
3. [`deploy/agency-whitelabel-domains-migration.sql`](file:///Users/jaysisharma/Desktop/clientpulse/deploy/agency-whitelabel-domains-migration.sql) — White-labeling & CNAME routing
4. [`deploy/agency-collaboration-migration.sql`](file:///Users/jaysisharma/Desktop/clientpulse/deploy/agency-collaboration-migration.sql) — Internal notes & draft review
5. [`deploy/agency-executive-radar-migration.sql`](file:///Users/jaysisharma/Desktop/clientpulse/deploy/agency-executive-radar-migration.sql) — Executive radar indexes & agency billing
