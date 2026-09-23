# Frevio — Feature Tracker

> Status: ✅ Done · 📋 Planned  
> 📌 **Master Roadmap & Product Tracker:** See [`PRODUCT_TRACKER.md`](./PRODUCT_TRACKER.md) for full freelancer status & the upcoming Agency SaaS evolution.

---

## ✅ All Shipped Features

### Auth & Onboarding
| Feature | Page / Notes |
|---|---|
| Email/password + Google OAuth | Supabase Auth |
| Auth callback — redirects new users to onboarding | `/auth/callback` |
| Onboarding wizard | `/onboarding` — 3-step: name → project → share link |

### Projects
| Feature | Page / Notes |
|---|---|
| Project create | `/project/new` — name, client, email, color picker |
| Project list | `/project` |
| Project detail | `/project/[id]` — updates, hours, budget, approvals |
| Project settings — edit + delete | `/project/[id]/settings` — includes budget field |
| Project status toggle | Dropdown: active → paused → completed |
| Free plan enforcement | Max 3 projects for free users |
| Archive page | `/archive` — completed projects only |

### Updates
| Feature | Page / Notes |
|---|---|
| Create / edit / delete update | `/project/[id]/update` |
| Copy-paste email preview | Inline plain-text (free plan) |
| Auto email sending via Resend | Pro plan only, sends to client email |

### Client-facing
| Feature | Page / Notes |
|---|---|
| Public status page | `/p/[slug]` — shows updates, approvals |
| Subscribe to updates | `/p/[slug]/subscribe` |
| Feedback widget | 👍 / 👎 / message |
| Approval responses | Approve / request changes buttons on status page |
| Client portal login | `/client/login` → `/client/dashboard` — projects + invoices |

### Approval Requests
| Feature | Page / Notes |
|---|---|
| Create approval request | From project detail — title + deliverable URL |
| Client responds | Approve / Request changes on public status page |
| Status badges | pending / approved / changes_requested |

### Meeting Notes
| Feature | Page / Notes |
|---|---|
| Create / delete notes | `/project/[id]/notes` |
| Decisions + action items | Dynamic lists, accordion view |

### Contracts
| Feature | Page / Notes |
|---|---|
| Create contract | `/project/[id]/contract` — fixed or retainer, amount, terms |
| Client signing page | `/contract/[id]` — public, name + checkbox agreement |
| Signed status | Timestamp + name stored on signature |

### Invoices
| Feature | Page / Notes |
|---|---|
| Invoice list + summary | `/invoices` — total / paid / outstanding |
| Create invoice | `/invoices/new` — line items, project link, notes |
| Invoice detail + print | `/invoices/[id]` — print-ready, branded |
| Mark sent / paid / delete | Inline actions |

### Time Tracker
| Feature | Page / Notes |
|---|---|
| Start / stop timer | `/time` — live clock, auto-saves |
| Manual time entry | Description, hours, project, date |
| Hours widget on project | Total logged per project |

### Budget Tracker
| Feature | Page / Notes |
|---|---|
| Budget field | Set in project settings |
| Progress bar widget | Project detail — invoiced vs budget, over-budget alert |

### Earnings
| Feature | Page / Notes |
|---|---|
| Earnings dashboard | `/earnings` — monthly bar chart, total / this month / outstanding |

### Testimonials
| Feature | Page / Notes |
|---|---|
| Client submission form | `/testimonial/[projectId]` — star rating + message |
| Review & approve | `/testimonials` — pending queue + approved list |
| Testimonial request link | Shown on completed project pages |

### Settings & Billing
| Feature | Page / Notes |
|---|---|
| Profile + logo upload | `/settings` |
| Accent color picker | Pro only |
| Stripe billing | Checkout + webhook |

### Landing
| Feature | Page / Notes |
|---|---|
| Marketing page | `/` — hero, how it works, pricing |

---

## 🚀 New Features Roadmap

> Legend: ✅ Done · 🔄 In progress · ⬜ Pending

### Batch 1 — Core billing gap
| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | **Invoice payment link** — "Pay now" Stripe button on public `/invoice/[id]` page | ✅ Done | `/api/pay-invoice` + `PayNowButton` + webhook |
| 2 | **Invoice due dates** — `due_date` field on create form, shown on invoice detail | ✅ Done | Was already fully implemented |

### Batch 2 — Client experience
| # | Feature | Status | Notes |
|---|---|---|---|
| 3 | **Overdue invoice reminders** — "Send reminder" button that re-emails client | ✅ Done | `reminder` param on `send-invoice` + button in `InvoiceActions` |
| 4 | **Client commenting on updates** — leave a comment on a specific update card | ✅ Done | `update_comments` table + API + `UpdateCommentForm` on status page |

### Batch 3 — Freelancer productivity
| # | Feature | Status | Notes |
|---|---|---|---|
| 5 | **Hourly rate per project** — `hourly_rate` on project, show billable value on Time page | ✅ Done | Schema + new/settings forms + billable stat card on Time page |
| 6 | **Update reminder email to self** — Resend email when project hits 7-day no-update | ✅ Done | `/api/remind-self` + `RemindSelfButton` on dashboard overdue rows |

### Batch 4 — Growth & quality of life
| # | Feature | Status | Notes |
|---|---|---|---|
| 7 | **CSV export** — download earnings + time entries as CSV | ✅ Done | `/api/export-csv?type=earnings\|time` + Download buttons on both pages |
| 8 | **Duplicate project** — "New project from this one" copies settings/client/rate | ✅ Done | `/api/duplicate-project` + button in project settings |

### Batch 5 — Revenue & branding
| # | Feature | Status | Notes |
|---|---|---|---|
| 9 | **White-label Pro** — hide "Powered by Frevio" footer on status pages | ✅ Done | Conditionally rendered based on `owner.plan` on status page |
| 10 | **Annual billing option** — Monthly $12 / Annual $99 toggle on upgrade page | ✅ Done | Toggle UI on upgrade page with savings callout |

### Batch 6 — Portfolio & docs
| # | Feature | Status | Notes |
|---|---|---|---|
| 11 | **Custom username slug** — `/u/yourname` public portfolio URL in settings | ✅ Done | `username` column + settings input + `/u/[username]` redirect route |
| 12 | **Shareable proposal links** — public `/doc/[id]` page like contracts | ✅ Done | Already fully built at `/doc/[id]` with accept/decline/sign |

### Batch 7 — Milestones
| # | Feature | Status | Notes |
|---|---|---|---|
| 13 | **Project milestones** — title + due date + done toggle, shown on status page | ✅ Done | `milestones` table + `MilestonesWidget` on project page |
| 14 | **Project milestones on client status page** — visible to client in `/p/[slug]` | ✅ Done | Progress bar + checklist rendered on status page |

### Batch 8 — Kickoff Checklist (user idea)
| # | Feature | Status | Notes |
|---|---|---|---|
| 15 | **Project kickoff checklist** — dual-sided todo list (freelancer + client tasks) before work begins | ✅ Done | `checklist_items` table + `KickoffChecklist` widget + `ClientChecklist` on status page |

### Batch 9 — Editor Extension & Real-Time Presence
| # | Feature | Status | Notes |
|---|---|---|---|
| 16 | **VS Code / Antigravity Extension** — auto-detect active coding, smart idle pause, link workspaces | ✅ Done | `extension/` package, commands, status bar, and heartbeat engine |
| 17 | **Real-time Client Presence** — live "Currently working" pulse + recent activity on client status page | ✅ Done | `/p/[slug]` dynamic presence badge + project settings toggle |
| 18 | **Extension API & Token Management** — bearer authentication, token generation & revocation | ✅ Done | `/api/extension/token`, `/api/extension/projects`, `/api/extension/heartbeat` |
| 19 | **Automated Time Consolidation** — merge consecutive coding intervals into clean time entries | ✅ Done | Consolidated into `time_entries` with `[VS Code]` source badge |

### Batch 10 — Instant Freelancer Activity Alerts
| # | Feature | Status | Notes |
|---|---|---|---|
| 20 | **Client comment email alert** — notifies freelancer when client comments on an update | ✅ Done | `/api/update-comment` + `notifyFreelancerOfComment` via Resend |
| 21 | **Status feedback email alert** — alerts freelancer on 👍/👎/messages from client status page | ✅ Done | `/api/feedback` + `notifyFreelancerOfFeedback` via Resend |
| 22 | **Approval response email alert** — immediate notification when client approves or requests changes | ✅ Done | `/api/approvals/[id]` + `notifyFreelancerOfApproval` via Resend |

### Batch 11 — Digital Marketing Freelancer Suite
| # | Feature | Status | Notes |
|---|---|---|---|
| 23 | **Custom KPI Snapshot Strip** — 1-4 custom performance pills (ROAS, CPA, Spend, Leads) on client portal & dashboard | ✅ Done | `projects.kpis` + `KpiSnapshotStrip` component + settings editor |
| 24 | **Live Embedded Reports** — interactive Looker Studio / Sheets / BI dashboard tab on client portal | ✅ Done | `projects.report_embed_url` + Reports tab in `/p/[slug]` with fullscreen mode |
| 25 | **Loom & Video Walkthrough Embeds** — playable video briefings in weekly client broadcasts | ✅ Done | `updates.video_url` + `VideoEmbed` component + `/project/[id]/update` input + email CTA |
| 26 | **Marketing Deliverable Types** — ad creatives, copy decks, and analytics reports in approvals | ✅ Done | Expanded `preview_type` with custom icons, actions, and preview cards |
| 27 | **Marketing Blocker Presets** — instant tags for Meta/Google access, declined ad cards, pixel tracking | ✅ Done | Added to `ClientBlockerCard` presets for 1-click client nudges |

### Batch 12 — Role-Based Persona Onboarding & Workspace Modules
| # | Feature | Status | Notes |
|---|---|---|---|
| 28 | **1-Click Craft Persona Onboarding** — 5 specialized disciplines (Developer, Marketer, Designer, Consultant, General) | ✅ Done | Step 2 in `/onboarding` sets user craft and seeds default module flags |
| 29 | **Granular Workspace Feature Flags** — modular toggle matrix with database persistence | ✅ Done | `users.enabled_modules` JSONB + `users.craft` + `/api/users/modules` endpoint |
| 30 | **Settings Modules Control Center** — dedicated management hub with quick presets & live toggles | ✅ Done | `/settings` Workspace Modules card with instant sync |
| 31 | **Adaptive Contextual UI** — conditionally display/hide developer telemetry & marketing analytics | ✅ Done | Hides VS Code token card when dev module disabled; hides Marketing tab when marketing module disabled |

---

## 📋 Icebox (future ideas)

- Custom domain for status pages (`status.yourdomain.com`)
- Multi-client per project (CC multiple emails)
- Slack / Discord notifications for new feedback
- Referral / UTM tracking on "Powered by Frevio" footer

---

_Last updated: 2026-09-23_
