'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, FileSignature, ClipboardList, Check, ChevronRight, Loader2 } from 'lucide-react'

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

• [Deliverable 1 — e.g., Architecture design and technical roadmap]
• [Deliverable 2 — e.g., Core application features and client portal]
• [Deliverable 3 — e.g., Database migrations and API integration]
• [Deliverable 4 — e.g., End-to-end testing and performance audits]
• [Deliverable 5 — e.g., Production deployment and handoff call]

─────────────────────────────────────────

TIMELINE

Estimated duration: [X weeks]

Phase 1 — Discovery & Strategy        [X days]
Phase 2 — Core Execution & Build      [X days]
Phase 3 — Review, QA & Delivery       [X days]

Timeline begins upon receipt of the deposit and project assets.

─────────────────────────────────────────

INVESTMENT

Project total: $[Amount]

Payment schedule:
  • 50% deposit — due before work begins
  • 50% final payment — due upon project completion

Payments accepted via bank transfer, credit card, or Stripe.

─────────────────────────────────────────

NOT INCLUDED IN THIS PROPOSAL

• Ongoing maintenance beyond the 30-day warranty period
• Third-party hosting, infrastructure, or domain fees
• [Any other specific exclusions]

─────────────────────────────────────────

NEXT STEPS

To accept this proposal, please sign and return the approval. I will deliver the formal service agreement and kickoff schedule promptly.

${freelancer || '[Your Name]'}`,

  agreement: (client, freelancer) => `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} between:

  Service Provider: ${freelancer || '[Your Name]'} ("Specialist")
  Client:           ${client || '[Client Name]'} ("Client")

─────────────────────────────────────────

1. SERVICES

Specialist agrees to provide the following deliverables:

[Describe the services in detail — e.g., Web application development, brand strategy, design systems, and integrations for Client's digital platforms.]

─────────────────────────────────────────

2. COMPENSATION & TERMS

2.1  Total investment: $[Amount]
2.2  Payment terms:
       • $[X] initial deposit prior to work commencement
       • $[X] final settlement due upon final handover

2.3  Invoices are payable within 14 calendar days of issuance.
2.4  Unsettled balances past 30 days may incur a 1.5% monthly late interest.

─────────────────────────────────────────

3. INTELLECTUAL PROPERTY

Upon receipt of full payment, Client receives full assignment of rights to all custom deliverables produced specifically under this Agreement. Specialist retains right to feature anonymized work samples in professional portfolios.

─────────────────────────────────────────

4. REVISIONS & CHANGE REQUESTS

This agreement includes [X] rounds of feedback revisions. Additional modifications or scope adjustments are billed at $[Rate]/hour.

─────────────────────────────────────────

5. CONFIDENTIALITY

Both parties commit to keeping confidential all proprietary or sensitive commercial information shared throughout the collaboration.

─────────────────────────────────────────

6. INDEPENDENT SPECIALIST

Specialist operates solely as an independent contractor. Nothing herein creates an employer-employee or agency relationship.

─────────────────────────────────────────

7. WARRANTIES & LIABILITY

Deliverables will be completed with high industry standards of craftsmanship. Total financial liability under this engagement will not exceed the total fees received.

─────────────────────────────────────────

8. TERMINATION

Either party may cancel with 7 days written notice. Client agrees to compensate for all hours and milestones fulfilled up to the termination date.

─────────────────────────────────────────

By signing, both parties approve and enact the terms detailed above.

${freelancer || '[Your Name]'}
Independent Specialist`,

  requirements: (client, freelancer) => `PROJECT REQUIREMENTS SPECIFICATION

Project:  [Project Name]
Client:   ${client || '[Client Name]'}
Author:   ${freelancer || '[Your Name]'}
Date:     ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Version:  1.0 — Approved Baseline

─────────────────────────────────────────

1. EXECUTIVE SUMMARY

[Describe the project scope: what it builds, target audience, and primary objectives.]

Business Goal:   [e.g., Streamline client intake and automated booking]
Success Metrics: [e.g., 50% reduction in customer support requests]

─────────────────────────────────────────

2. FUNCTIONAL SPECIFICATIONS

2.1  User Identity & Roles
     • [e.g., Secure authentication via Magic Links and OAuth]
     • [e.g., Multi-tier roles: Administrator, Collaborator, Viewer]

2.2  Core Capabilities
     • [Feature 1 — specification details]
     • [Feature 2 — specification details]
     • [Feature 3 — specification details]

2.3  Data Storage & Assets
     • [e.g., Encrypted asset storage for high-resolution files]
     • [e.g., Automatic backup snapshots and retention policies]

─────────────────────────────────────────

3. TECHNICAL CRITERIA

Platform:        [Web Application / iOS / Cross-platform]
Frontend:        [e.g., Next.js 15, React, Tailwind CSS]
Backend:         [e.g., Supabase PostgreSQL, Edge Functions]
Performance:     First Contentful Paint < 1.0s, 95+ Lighthouse Score
Security:        Full RLS enforcement and HTTPS end-to-end

─────────────────────────────────────────

4. SCOPE BOUNDARIES

The following items are outside the current project scope:
• [e.g., Native iOS/Android builds]
• [e.g., Custom payment gateways outside Stripe]
• [e.g., Ongoing SEO management]

─────────────────────────────────────────

5. MILESTONE TARGETS

Kickoff Alignment:        [Date]
Prototype Verification:   [Date]
Release Candidate Beta:   [Date]
Production Launch:        [Date]

─────────────────────────────────────────

6. APPROVAL SIGN-OFF

Client verification confirms that these requirements accurately encapsulate engagement goals. Scope adjustments will follow formal change management.`,
}

const DOC_TYPES: { type: DocType; label: string; desc: string; icon: React.ElementType }[] = [
  {
    type: 'proposal',
    label: 'Project Proposal',
    icon: FileText,
    desc: 'Scope, timeline milestones, and investment pricing. Send before client signs off.',
  },
  {
    type: 'agreement',
    label: 'Service Agreement',
    icon: FileSignature,
    desc: 'Formal legal contract with payment schedule, intellectual property, and terms.',
  },
  {
    type: 'requirements',
    label: 'Requirements Doc',
    icon: ClipboardList,
    desc: 'Functional and technical requirements blueprint for structured scope alignment.',
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
    setSaving(true)
    setError('')
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
      <DarkShell>
        <div className="max-w-3xl animate-fade-in relative z-10 pb-12">
          {/* Back navigation */}
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to documents
          </Link>

          {step === 'type' ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Document Studio
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                  Create document
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                  Select a tailored template with structured legal and strategic copy to present to clients.
                </p>
              </div>

              {/* Template Selection Cards */}
              <div className="space-y-3.5">
                {DOC_TYPES.map(({ type, label, desc, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => selectType(type)}
                    className="w-full group bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-5 sm:p-6 text-left hover:border-slate-400 dark:hover:border-white/30 transition-all backdrop-blur-md shadow-xs dark:shadow-none flex items-center gap-5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-white mb-0.5 flex items-center gap-2">
                        {label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-light line-clamp-2">
                        {desc}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Change type pill */}
              <button
                type="button"
                onClick={() => setStep('type')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-3 h-3" /> Change template
              </button>

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {DOC_TYPES.find(d => d.type === docType)?.label}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                  Document details
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                  Fine-tune proposal terms, milestones, and deliverable content before publishing.
                </p>
              </div>

              <div className="space-y-6">
                {/* Meta details card */}
                <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-5 backdrop-blur-md shadow-xs dark:shadow-none">
                  <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                      Document Metadata
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                      Title, client association, and optional financial commitments.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Document title
                    </label>
                    <input
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                      placeholder="e.g. Supabase Integration Proposal — Acme Corp"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Link to project <span className="font-normal lowercase text-slate-400">(optional)</span>
                    </label>
                    <select
                      value={projectId}
                      onChange={e => handleProjectChange(e.target.value)}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#0c0d12] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                    >
                      <option value="">— Standalone / No linked project —</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.project_name} ({p.client_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Client name
                      </label>
                      <input
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                        placeholder="Acme Corp"
                        value={clientName}
                        onChange={e => handleClientNameChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Client email
                      </label>
                      <input
                        type="email"
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                        placeholder="client@acme.com"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {docType !== 'requirements' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Investment amount ($) <span className="font-normal lowercase text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                        placeholder="5000"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Content editor */}
                <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-4 backdrop-blur-md shadow-xs dark:shadow-none">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                        Document Body
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                        Full markdown content ready for client distribution.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      {content.length} characters
                    </span>
                  </div>

                  <textarea
                    className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] text-slate-800 dark:text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors resize-none"
                    rows={26}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    spellCheck={false}
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300">
                    {error}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => save('draft')}
                    disabled={!title.trim() || saving}
                    className="w-full sm:w-auto rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-5 py-2.5 text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                  >
                    Save as draft
                  </button>
                  <button
                    type="button"
                    onClick={() => save('sent')}
                    disabled={!title.trim() || saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-6 py-2.5 text-xs transition-all shadow-xs disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save & mark sent
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
