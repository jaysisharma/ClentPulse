import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — Frevio',
}

const UPDATED = 'September 8, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-slate-100 py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Frevio
        </Link>

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Legal & Privacy Compliance
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">Effective date: {UPDATED}</p>
        </div>

        <div className="mt-8 bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 sm:p-10 shadow-xs dark:shadow-none space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
          <section className="space-y-3">
            <p>
              This policy explains what information Frevio (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Service&rdquo;) collects, how we use it, and the
              choices you have. By accessing or using Frevio, you consent to the practices described in this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">01.</span> Information We Collect
            </h2>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span><strong className="font-semibold text-slate-900 dark:text-white">Account data</strong> — your name, email address, avatar, and authentication credentials (hashed and secured via our identity provider).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span><strong className="font-semibold text-slate-900 dark:text-white">Workspace records</strong> — client profiles, project milestones, status logs, itemized invoices, contract terms, and recorded billable hours.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span><strong className="font-semibold text-slate-900 dark:text-white">Financial & billing data</strong> — encrypted and processed exclusively through Stripe; we maintain customer tokens and subscription tier states, never raw credit card details.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span><strong className="font-semibold text-slate-900 dark:text-white">Operational logs</strong> — essential access records and diagnostic signals required to safeguard infrastructure against malicious activity and ensure high availability.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">02.</span> How We Utilize Information
            </h2>
            <p>
              We process data to deliver, maintain, and optimize the Frevio platform, facilitate secure payment processing, dispatch vital notifications (verification tokens, invoice payment receipts, deadline reminders, and weekly digests), prevent fraudulent actions, and satisfy statutory compliance. We never monetize, sell, or rent your personal data to external advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">03.</span> Infrastructure Partners
            </h2>
            <p>Data is transferred strictly to vetted cloud infrastructure providers required to operate Frevio:</p>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span><strong className="font-semibold text-slate-900 dark:text-white">Supabase</strong> — managed PostgreSQL database, authentication, and encrypted document storage.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span><strong className="font-semibold text-slate-900 dark:text-white">Stripe</strong> — PCI-DSS Level 1 payment gateways, subscription settlements, and invoice checkout portals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span><strong className="font-semibold text-slate-900 dark:text-white">Resend</strong> — transactional email delivery for updates, approvals, and reminders.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span><strong className="font-semibold text-slate-900 dark:text-white">Vercel</strong> — global edge execution and web serving environment.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">04.</span> Cookies & Local State
            </h2>
            <p>
              We deploy essential first-party cookies and local storage tokens strictly to maintain authenticated user sessions and store interface preferences (such as light or dark themes). We do not embed third-party surveillance or tracking pixels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">05.</span> Data Retention & Purging
            </h2>
            <p>
              Workspace assets are retained while your subscription is active. Upon account termination, workspace records are permanently purged following standard grace periods, excluding financial transaction ledgers mandated by tax authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">06.</span> Security Architecture
            </h2>
            <p>
              We enforce end-to-end TLS encryption in transit, AES-256 encryption at rest, Supabase Row-Level Security (RLS) policies at the database layer, and isolated secret management.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">07.</span> Your Rights & Inquiries
            </h2>
            <p>
              You maintain the right to inspect, export, modify, or permanently expunge your personal records under applicable GDPR and CCPA statutes. For inquiries, contact our data protection team directly at{' '}
              <a href="mailto:support@frevio.app" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                support@frevio.app
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-6 text-xs text-slate-500 dark:text-slate-400">
          <span>Frevio Studio Operating System</span>
          <Link href="/terms" className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}
