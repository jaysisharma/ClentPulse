# Frevio — Go-To-Market & Viral Acquisition Playbook (Phase 3)

> **Goal:** Acquire your first 50 paying freelancers (Pro, $19/mo) and 10 agency subscriptions (Agency $49/mo, Agency Scale $199/mo) within 30 days of launch.
>
> **Prices:** always quote `src/lib/plans.ts`: Free (2 active projects) · Pro $19/mo or $190/yr · Agency $49/mo (5 seats) · Agency Scale $199/mo (25 seats).
> **Launch promo:** the first 50 freelancer signups automatically get 1 month of Pro free. No code needed.

---

## 🐱 0. Product Hunt (and other general launch platforms)

**One message only:** the client portal. Leave agency/white-label and the VS Code extension for separate launches (Show HN, r/webdev).

* **Name:** Frevio
* **Tagline (≤60 chars):** One private page where clients review, approve & pay
* **Description:** Clients don't ignore you. They lose you between five apps. Frevio gives each project one private link where clients see progress, approve deliverables and pay Stripe invoices, with no client passwords and no Frevio transaction fees. Free for 2 active projects.
* **Thumbnail:** `public/logo.png` (square)
* **Gallery order** (ready in `~/Desktop/frevio-launch-assets/`, 1270×760 @2x):
  1. `00-social-card-1200x630.png`: headline + portal
  2. `01-client-portal-waiting-on-you.png`
  3. `02-deliverable-approvals.png`
  4. `03-client-uploads-and-invoices.png`
  5. `04-milestones.png`
  6. 45s video (below)
* **Product link:** https://frevio.cloud/?ref=producthunt (shows "Welcome, Product Hunt 👋" and records the source on signup)
* **Demo link (put in the maker comment):** https://frevio.cloud/demo?ref=producthunt
* **Maker comment:**
> Hey Product Hunt 👋 I'm Jaysi. I built Frevio because my clients kept asking "any updates?" while the answer was buried across email, Slack, Figma and a PDF invoice.
>
> Frevio gives each client one private page: progress updates, deliverables to approve, a checklist of what you're waiting on from them, and invoices they can pay by card. Clients never create an account.
>
> Free for 2 active projects, and the first 50 signups get a month of Pro on us. You can click through the client view without signing up: https://frevio.cloud/demo?ref=producthunt
>
> I'd love brutal feedback, especially on what's missing for your workflow.

* **Do not claim:** that approvals auto-generate invoices, or that Frevio runs workflows on its own. Neither exists yet.

---

## 🗺️ 0b. Multi-Platform Launch Plan

### Always use a tagged link
Every link you post should carry `?ref=<platform>`. The homepage then greets the visitor by name, and the platform is saved on their account at signup. Compare platforms in **Admin → Marketing**, under signups by source.

| Platform | Link to post | Angle |
|---|---|---|
| Product Hunt | `https://frevio.cloud/?ref=producthunt` | Client portal (section 0) |
| DevHunt | `https://frevio.cloud/?ref=devhunt` | Developers: VS Code presence + portal |
| Hacker News (Show HN) | `https://frevio.cloud/?ref=hackernews` | Technical write-up (section 2C) |
| Indie Hackers | `https://frevio.cloud/?ref=indiehackers` | Build-in-public story + launch numbers |
| Reddit | `https://frevio.cloud/?ref=reddit` | Lead with the free calculators, not the product |
| Peerlist | `https://frevio.cloud/?ref=peerlist` | Launchpad, same copy as Product Hunt |
| Uneed / Fazier / Microlaunch | `?ref=uneed` / `?ref=fazier` / `?ref=microlaunch` | Short directory listing |
| BetaList | `https://frevio.cloud/?ref=betalist` | Early-access listing |
| X / LinkedIn | `?utm_source=x` / `?utm_source=linkedin` | Thread / founder post |

### DevHunt copy (developer audience)
* **Tagline:** Client portal that updates itself from VS Code
* **Description:** Frevio gives each client one private page with progress, deliverable approvals and Stripe invoices. The optional VS Code extension shows clients a live "currently working on this" pulse with a high-level focus area (like "Backend & API"). It never sends code, file contents or keystrokes. Next.js 16, Supabase Realtime, Stripe Connect. Free for 2 projects.
* **First comment:** what's sent by the extension (focus category + heartbeat only), the 5-minute idle auto-pause, and that presence can be turned off per project.

### Short directory copy (Uneed, Fazier, Microlaunch, BetaList, SaaSHub, AlternativeTo)
* **One-liner:** One private page where clients review, approve & pay.
* **50 words:** Frevio replaces the email-Slack-PDF shuffle with one private link per client. Post progress updates, get deliverables approved, collect files and get paid through Stripe, with no client passwords and no Frevio transaction fees. Free for 2 active projects.
* **Categories:** Freelance, Client Portal, Invoicing, Productivity
* **Alternatives to list against:** HoneyBook, Bonsai, Dubsado, Moxie, Notion client portals

### Schedule
| When | What |
|---|---|
| Week before | Submit to BetaList, Uneed, Fazier, Microlaunch, SaaSHub, AlternativeTo (some have queues). Line up 20–30 supporters with a "launching Tuesday" DM. |
| Launch day (Tue–Thu, 12:01 AM PT) | Product Hunt + Peerlist. Maker comment immediately. Post on X/LinkedIn with the video. Reply to every comment within the hour. |
| Same day, afternoon | Indie Hackers post: "Launched today, here's the stack and the first numbers". |
| +2 days | DevHunt (developer angle). |
| +3–5 days | Show HN (technical post), r/webdev (architecture), r/freelance (lead with the free scope creep calculator). |
| +7 days | Indie Hackers follow-up with real numbers by source from the admin dashboard. |

### Things that move signups more than upvotes
1. **Reply fast and personally.** Every Product Hunt/DevHunt comment gets a real answer, and every feature request gets "added to the roadmap" with a link to `/roadmap`.
2. **Email the launch-day signups yourself.** A personal 3-line email from jaysi@frevio.cloud on day 1 ("what made you sign up? what's missing?") turns signups into active users and gives you testimonials.
3. **Reddit: give before you ask.** Post the free calculators (`/calculator`, `/calculator/scope-creep`, `/calculator/invoice-generator`) as free tools. Never lead with "check out my SaaS". Link with `?ref=reddit`.
4. **Answer existing threads.** Search Reddit/X/Indie Hackers for "client portal", "HoneyBook alternative", "clients don't reply", "chasing invoices". Reply helpfully and mention Frevio only when it fits.
5. **Every client portal is an ad.** Free-plan portals show "Powered by Frevio · Create your client portal". Each user you activate shows Frevio to their clients.
6. **Post the numbers.** "Launched on 5 platforms, here's what converted" posts do well on Indie Hackers and X, and your admin dashboard now has the data.

---

## 🎬 1. The 45-Second "Show, Don't Tell" Demo Video

The fastest way to convert engineers and studio founders is **visual proof**. 

### 📐 Video Format
* **Aspect Ratio:** 16:9 for desktop/X, 9:16 crop for TikTok/Reels/Shorts.
* **Layout:** Lead with the client portal (`/p/[slug]`) full screen. Cut to the split screen (VS Code left, portal right) only for the developer beat.
* **Audience note:** For Product Hunt, show the portal flow first. For Show HN and r/webdev, open on the VS Code split screen instead.

### ⏱️ Storyboard & Script

| Second | Visual | Audio / Voiceover |
|---|---|---|
| **0:00 – 0:08** | **The Hook:** Notifications pop up on phone: *"Hey, any updates on the checkout page?"*, *"Is anyone working on this today?"* | *"If you're a freelancer or agency owner, you know this text at 11 PM. Clients get anxious when there's silence."* |
| **0:08 – 0:18** | **The Magic:** You open VS Code and switch files (`PaymentGateway.ts`). On the right screen, the client portal instantly pulses green: `● Alex is working on this (Focus: Payment Gateway)`. | *"Meet Frevio. Our lightweight VS Code extension automatically sends high-level focus heartbeats directly to your client's private portal in real time. Zero code or keystrokes transmitted."* |
| **0:18 – 0:28** | **Financial Defense:** Client opens the portal. It shows a **50% Kickoff Deposit Gate ($4,500)**. They click pay with Stripe. The moment it settles, deliverables and staging unlock automatically. | *"Best part? Work doesn't start until cash is in the bank. Frevio gates client deliverables behind upfront deposits."* |
| **0:28 – 0:38** | **Deliverable Approvals:** Client clicks "Inspect Figma Prototype" and clicks "Approve" with a 1-click note. | *"Figma prototypes, live staging URLs, and PRs get approved in one place. No more lost feedback in 40-message Slack threads."* |
| **0:38 – 0:45** | **Call to Action:** Screen shows the white-labeled custom domain (`status.youragency.com`) and points to the live demo. | *"Give your clients the luxury agency experience. Try the live interactive demo at frevio.cloud/demo."* |

---

## 🐦 2. Social Launch Copy

### 🧵 A. The Viral X (Twitter) Launch Thread

**Tweet 1 (Hook + Video):**
> Freelancers and agency owners: Stop answering "Any updates?" texts at 11 PM.
>
> I spent the last 4 months building Frevio: one private page per client where they see progress, approve deliverables and pay you.
>
> Here’s how it works (and why your clients will love you for it) 👇 [Attach 45s Video]

**Tweet 2 (For developers: the telemetry wedge):**
> 1. Real-time presence without surveillance (optional, for devs).
>
> Freelancers hate writing status reports. Clients hate radio silence.
>
> Our VS Code extension sends lightweight heartbeats (e.g. "Focus: Frontend & UI"). Clients see a reassuring live pulse dot whenever you’re in their workspace. Zero code or keystrokes are ever sent.

**Tweet 3 (Financial Defense):**
> 2. Kickoff deposit gating.
>
> Unbilled scope and late deposits kill freelance cash flow.
>
> With Frevio, you set a 25%, 33%, or 50% deposit. Deliverables and project status remain locked behind Stripe Checkout until payment is confirmed.

**Tweet 4 (Agency Scale & White-Labeling):**
> 3. White-labeling & custom CNAME domains.
>
> Point `status.youragency.com` with a single DNS CNAME record.
>
> Custom branding, staffed specialist pods, and internal draft reviews so your team stays aligned before anything goes client-facing.

**Tweet 5 (The Call to Action):**
> Try the live interactive client portal right now without signing up:
> 🔗 https://frevio.cloud/demo
>
> The first 50 signups get a month of Pro free, automatically. Reply with feedback and I'll read every one.

---

### 💬 B. Reddit Strategy (`r/webdev`, `r/freelance`, `r/agency`)

#### `r/webdev` (Focus on Architecture & Dev Experience)
* **Title:** *I got tired of writing status updates for clients, so I built a VS Code extension that syncs real-time focus areas to a Next.js portal (Next.js 16 + Supabase Realtime)*
* **Post Highlights:**
  - Share the architectural challenge of privacy-first telemetry (deriving focus categories from file extensions without transmitting ASTs or tokens).
  - Edge routing for custom agency domains with Next.js 16 middleware (`proxy.ts`).
  - Webhook idempotency and timestamp ordering guards.
  - Link to `/demo` for people to inspect the UX.

#### `r/freelance` (Focus on Solving Client Anxiety & Late Payments)
* **Title:** *How I eliminated "any updates?" check-in texts from clients and guaranteed upfront deposits*
* **Post Highlights:**
  - Share the psychological shift: clients don't want to micromanage; they just want reassurance that their money isn't disappearing into a void.
  - Explain how deposit gates prevent clients from dragging their feet.

---

### 🚀 C. Hacker News (Show HN)

* **Title:** *Show HN: Frevio – A client portal synced to your code editor with deposit gating*
* **Text Post:**
> Hi HN,
>
> I built Frevio (https://frevio.cloud) to solve the two biggest friction points in freelance software engineering: status anxiety and delayed deposits.
>
> Most client portals are clunky forms or glorified Notion templates. Frevio includes an official VS Code extension that broadcasts high-level active focus areas ("Backend & Database", "Frontend & UI") to a private client dashboard via Supabase Realtime. It never transmits code or keystrokes.
>
> Key technical highlights:
> - Next.js 16 App Router + React 19 + Tailwind v4.
> - Custom CNAME Edge proxy rewrites (`src/proxy.ts`) for custom domains.
> - Strict Stripe webhook idempotency and ordering timestamps.
> - 188 unit & integration tests in Vitest.
>
> You can test the client experience directly without an account here: https://frevio.cloud/demo
>
> I’d love your feedback on the architecture and UX.

---

## 🎯 3. Direct 1-on-1 Agency Outreach Playbook

Target **15–20 boutique agencies** (3–15 person software or design studios on Twitter, Dribbble, or Clutch).

### 📧 Cold Email Template

**Subject:** Quick question about {{AgencyName}}'s client status workflow

> Hi {{FirstName}},
>
> Loved your recent work on {{SpecificProjectOrDribbbleShot}} — the design polish was incredible.
>
> Quick question: When your team is knee-deep in sprint deliverables, how do you handle client status updates and deposit sign-offs without losing hours in Slack threads?
>
> We just launched **Frevio** (https://frevio.cloud), a luxury client portal built specifically for technical studios. It features:
> - Live IDE presence telemetry (clients see when your team is actively coding).
> - Upfront kickoff deposit gates via Stripe.
> - White-labeled CNAME domains (`status.{{AgencyDomain}}`).
>
> You can test a live interactive portal here in 30 seconds: https://frevio.cloud/demo
>
> I'd love to give {{AgencyName}} free lifetime access to our Agency tier in exchange for 10 minutes of brutal, honest feedback.
>
> Open to taking a look?
>
> Best,  
> Jaysi Sharma  
> Founder, Frevio

---

### 💬 Twitter / LinkedIn DM Template

> Hey {{FirstName}}! Huge fan of what you're building at {{AgencyName}}. 
> 
> Random question: How do you guys currently keep clients updated on sprint progress without having to write manual emails every week?
>
> We built a tool called Frevio that gives clients a live portal with IDE telemetry, deliverable sign-offs, and deposit gates. You can click through a live demo without an account here: https://frevio.cloud/demo
>
> Would love to gift you an Agency account if you find it helpful!

---

## 🔄 4. The Built-in Viral Referral Loop

Every client who views a Frevio portal (`/p/[slug]`) is an active buyer of agency and freelance services.

1. **Footer Referral Hook:**
   - Every public portal features: `Powered by Frevio · Create your client portal →`
   - Automatically drops a 30-day tracking cookie (`frevio_ref`) for the referring studio.
2. **Referral Reward Program:**
   - Offer referring freelancers **20% recurring monthly revenue share** or **1 free month of Pro per referred user**.
   - Feature the referral code link directly in `/settings`.
