'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, FileSignature, ClipboardList, Check } from 'lucide-react'

type DocType = 'proposal' | 'agreement' | 'requirements'
interface Project { id: string; project_name: string; client_name: string; client_email: string | null }

// ── Templates ─────────────────────────────────────────────────────────────────

const TEMPLATES: Record<DocType, (name: string, freelancer: string) => string> = {
  proposal: (client, freelancer) => `PROJECT PROPOSAL
Prepared for: ${client || '[Client Name]'}
Prepared by: ${freelancer || '[Your Name]'}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

─────────────────────────────────────────

OVERVIEW

[Briefly describe the project, the client's goal, and how you'll help them achieve it.]

─────────────────────────────────────────

SCOPE OF WORK

The following will be delivered as part of this engagement:

• [Deliverable 1 — e.g., Supabase database schema design and setup]
• [Deliverable 2 — e.g., Auth integration with Google OAuth and email/password]
• [Deliverable 3 — e.g., Row-level security policies for all tables]
• [Deliverable 4 — e.g., Storage bucket configuration and upload flow]
• [Deliverable 5 — e.g., Documentation and handoff call]

─────────────────────────────────────────

TIMELINE

Estimated duration: [X weeks]

Phase 1 — Discovery & Planning     [X days]
Phase 2 — Development              [X days]
Phase 3 — Testing & Handoff        [X days]

Timeline begins upon receipt of the deposit and project assets.

─────────────────────────────────────────

INVESTMENT

Project total: $[Amount]

Payment schedule:
  • 50% deposit — due before work begins
  • 50% final payment — due upon project completion

Payments accepted via bank transfer, PayPal, or Stripe.

─────────────────────────────────────────

NOT INCLUDED IN THIS PROPOSAL

• Ongoing maintenance beyond the handoff period
• Third-party service costs (hosting, subscriptions, etc.)
• [Any other exclusions]

─────────────────────────────────────────

NEXT STEPS

If you'd like to proceed, please accept this proposal. I'll send over a service agreement and invoice for the deposit so we can get started.

Questions? Reply to this email or reach out directly.

${freelancer || '[Your Name]'}`,

  agreement: (client, freelancer) => `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} between:

  Service Provider: ${freelancer || '[Your Name]'} ("Freelancer")
  Client:           ${client || '[Client Name]'} ("Client")

─────────────────────────────────────────

1. SERVICES

Freelancer agrees to provide the following services:

[Describe the services in detail — e.g., Supabase backend integration including auth, database design, RLS policies, and storage configuration for the Client's web application.]

─────────────────────────────────────────

2. PAYMENT

2.1  Total fee: $[Amount]
2.2  Payment schedule:
       • $[X] deposit due before work begins
       • $[X] final payment due upon project delivery

2.3  Invoices are due within 14 days of receipt.
2.4  Late payments accrue interest at 1.5% per month after the due date.

─────────────────────────────────────────

3. INTELLECTUAL PROPERTY

Upon receipt of full payment, Client will own all custom code and deliverables produced under this Agreement. Freelancer retains the right to reference this project in their portfolio unless Client requests otherwise in writing.

─────────────────────────────────────────

4. REVISIONS

This agreement includes [X] rounds of revisions. Additional revisions are billed at $[Rate]/hour.

─────────────────────────────────────────

5. CONFIDENTIALITY

Both parties agree to keep confidential any proprietary or sensitive information shared during the project and not to disclose it to third parties.

─────────────────────────────────────────

6. INDEPENDENT CONTRACTOR

Freelancer is an independent contractor. Nothing in this Agreement creates an employment, partnership, or joint venture relationship.

─────────────────────────────────────────

7. WARRANTIES & LIABILITY

Freelancer will deliver work with reasonable skill and care. Freelancer's total liability under this Agreement is limited to the total fees paid by Client.

─────────────────────────────────────────

8. TERMINATION

Either party may terminate this Agreement with 7 days written notice. Client agrees to pay for all work completed to the date of termination.

─────────────────────────────────────────

9. GOVERNING LAW

This Agreement is governed by the laws of [Your Jurisdiction].

─────────────────────────────────────────

By signing, both parties agree to the terms above.

${freelancer || '[Your Name]'}
Freelancer`,

  requirements: (client, freelancer) => `PROJECT REQUIREMENTS DOCUMENT

Project:  [Project Name]
Client:   ${client || '[Client Name]'}
Author:   ${freelancer || '[Your Name]'}
Date:     ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Version:  1.0 — Draft

─────────────────────────────────────────

1. PROJECT OVERVIEW

[Describe the project in 2–3 sentences: what it is, who it's for, and what problem it solves.]

Business goal: [e.g., Replace a manual spreadsheet process with an automated web app]
Success metric: [e.g., Reduce admin time from 5 hours/week to under 30 minutes]

─────────────────────────────────────────

2. FUNCTIONAL REQUIREMENTS

2.1  Authentication & Users
     • [e.g., Email/password and Google OAuth login]
     • [e.g., User roles: Admin and Member]
     • [e.g., Password reset via email]

2.2  Core Features
     • [Feature 1 — description]
     • [Feature 2 — description]
     • [Feature 3 — description]

2.3  Data & Storage
     • [e.g., Store user-generated files in Supabase Storage]
     • [e.g., File size limit: 10 MB per upload]

2.4  Notifications
     • [e.g., Email notification when X happens]

─────────────────────────────────────────

3. TECHNICAL REQUIREMENTS

Platform:        [Web / iOS / Android / Cross-platform]
Frontend:        [e.g., Next.js + Tailwind CSS]
Backend:         [e.g., Supabase — PostgreSQL, Auth, Storage, Edge Functions]
Hosting:         [e.g., Vercel (frontend) + Supabase Cloud (backend)]
Browser support: Latest versions of Chrome, Safari, Firefox, Edge
Performance:     Page load < 2 seconds on standard broadband
Accessibility:   WCAG 2.1 AA compliance

─────────────────────────────────────────

4. OUT OF SCOPE

The following are explicitly NOT included in this project:

• [e.g., Native mobile apps (iOS/Android)]
• [e.g., Third-party integrations beyond those listed above]
• [e.g., Ongoing maintenance after the handoff period]

─────────────────────────────────────────

5. TIMELINE & MILESTONES

Kickoff meeting:        [Date]
Requirements sign-off:  [Date]
First working build:    [Date]
Client review:          [Date]
Final delivery:         [Date]

─────────────────────────────────────────

6. ASSUMPTIONS

• Client will provide all content, copy, and assets by [Date]
• Client will have a designated point of contact available for feedback within 2 business days
• [Any other assumptions]

─────────────────────────────────────────

7. SIGN-OFF

Client approval of this document confirms that the requirements accurately reflect the project needs. Changes to requirements after sign-off may affect the timeline and/or cost and will be handled via a change request.`,
}

const DOC_TYPES: { type: DocType; label: string; desc: string; icon: React.ElementType; color: string; border: string }[] = [
  {
    type: 'proposal', label: 'Project Proposal', icon: FileText,
    desc: 'Scope, timeline, and pricing. Send before a client commits.',
    color: 'bg-violet-50', border: 'border-violet-200',
  },
  {
    type: 'agreement', label: 'Service Agreement', icon: FileSignature,
    desc: 'Formal contract with payment terms, IP, and signing.',
    color: 'bg-blue-50', border: 'border-blue-200',
  },
  {
    type: 'requirements', label: 'Requirements Doc', icon: ClipboardList,
    desc: 'Functional and technical requirements for sign-off.',
    color: 'bg-amber-50', border: 'border-amber-200',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewDocPage() {
  const router = useRouter()
  const [step, setStep] = useState<'type' | 'form'>('type')
  const [docType, setDocType] = useState<DocType>('proposal')
  const [projects, setProjects] = useState<Project[]>([])
  const [userId, setUserId] = useState('')
  const [freelancerName, setFreelancerName] = useState('')

  const [title, setTitle]           = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [projectId, setProjectId]   = useState('')
  const [amount, setAmount]         = useState('')
  const [content, setContent]       = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return
      setUserId(user.id)
      supabase.from('users').select('name').eq('id', user.id).single()
        .then(({ data }: { data: any }) => setFreelancerName(data?.name ?? ''))
      supabase.from('projects').select('id,project_name,client_name,client_email').eq('user_id', user.id).eq('status', 'active')
        .then(({ data }: { data: any }) => setProjects(data ?? []))
    })
  }, [])

  function selectType(t: DocType) {
    setDocType(t)
    setContent(TEMPLATES[t](clientName, freelancerName))
    setStep('form')
  }

  function handleProjectChange(pid: string) {
    setProjectId(pid)
    const p = projects.find(p => p.id === pid)
    if (p) {
      setClientName(p.client_name)
      setClientEmail(p.client_email ?? '')
      setContent(TEMPLATES[docType](p.client_name, freelancerName))
    }
  }

  function handleClientNameChange(name: string) {
    setClientName(name)
    setContent(TEMPLATES[docType](name, freelancerName))
  }

  async function save(status: 'draft' | 'sent') {
    if (!title.trim()) return
    setSaving(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.from('documents').insert({
      user_id: userId,
      project_id: projectId || null,
      type: docType,
      title: title.trim(),
      client_name: clientName || null,
      client_email: clientEmail || null,
      amount: amount ? parseFloat(amount) : null,
      content,
      status,
    }).select().single()
    if (err) { setError(err.message); setSaving(false); return }
    router.push(`/docs/${data.id}`)
  }

  return (
    <AppLayout>
      <div className="max-w-2xl animate-fade-in">
        <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to documents
        </Link>

        {step === 'type' ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">New document</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Choose a template to get started — all pre-filled with professional copy.</p>
            <div className="space-y-3">
              {DOC_TYPES.map(({ type, label, desc, icon: Icon, color, border }) => (
                <button
                  key={type}
                  onClick={() => selectType(type)}
                  className={`w-full flex items-center gap-5 rounded-2xl border ${border} ${color} p-5 text-left hover:shadow-md transition-all group`}
                >
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white mb-0.5">{label}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{desc}</div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setStep('type')} className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 mb-6 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />Change type
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {DOC_TYPES.find(d => d.type === docType)?.label}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Document details</h1>

            <div className="space-y-5">
              {/* Meta */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Details</h2>
                <Input label="Document title" placeholder={`e.g. Supabase Integration Proposal — Acme Corp`} value={title} onChange={e => setTitle(e.target.value)} required />
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1.5">Link to project (optional)</label>
                  <select
                    value={projectId}
                    onChange={e => handleProjectChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">— No project —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name} ({p.client_name})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Client name" placeholder="Acme Corp" value={clientName} onChange={e => handleClientNameChange(e.target.value)} />
                  <Input label="Client email" type="email" placeholder="client@acme.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                </div>
                {docType !== 'requirements' && (
                  <Input label="Amount ($) — optional" type="number" min="0" step="0.01" placeholder="5000" value={amount} onChange={e => setAmount(e.target.value)} />
                )}
              </div>

              {/* Content editor */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Content</h2>
                  <span className="text-xs text-slate-400">Edit the template to match your project</span>
                </div>
                <textarea
                  className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 transition-colors resize-none"
                  rows={28}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  spellCheck={false}
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => save('draft')} loading={saving} disabled={!title.trim()} className="flex-1 justify-center">
                  Save as draft
                </Button>
                <Button onClick={() => save('sent')} loading={saving} disabled={!title.trim()} className="flex-1 justify-center">
                  <Check className="w-4 h-4" />Save & mark sent
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
