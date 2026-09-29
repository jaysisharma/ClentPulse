# Frevio — Go-To-Market & Viral Acquisition Playbook (Phase 3)

> **Goal:** Acquire your first 50 paying freelancers and 10 agency subscriptions ($49–$249/mo) within 30 days of launch.

---

## 🎬 1. The 45-Second "Show, Don't Tell" Demo Video

The fastest way to convert engineers and studio founders is **visual proof**. 

### 📐 Video Format
* **Aspect Ratio:** 16:9 for desktop/X, 9:16 crop for TikTok/Reels/Shorts.
* **Layout:** Split Screen.
  * **Left Side (60%):** You coding in VS Code or Antigravity with the Frevio extension active.
  * **Right Side (40%):** The live client portal (`/p/[slug]`) open in a browser.

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
> I spent the last 4 months building Frevio — a client command center that connects your code editor directly to your client's portal.
>
> Here’s how it works (and why your clients will love you for it) 👇 [Attach 45s Video]

**Tweet 2 (The Telemetry Wedge):**
> 1. Real-time presence without surveillance.
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
> We're offering free lifetime grandfathered Pro seats to the first 50 freelancers who give feedback. DM me or comment below!

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
