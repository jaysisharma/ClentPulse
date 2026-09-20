import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — Frevio',
}

const UPDATED = 'September 8, 2026'

export default function TermsPage() {
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
              Contractual Framework
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">Effective date: {UPDATED}</p>
        </div>

        <div className="mt-8 bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 sm:p-10 shadow-xs dark:shadow-none space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">01.</span> Acceptance of Terms
            </h2>
            <p>
              By registering an account, integrating third-party tools, or accessing Frevio (&ldquo;the Service&rdquo;), you enter into a legally binding agreement with Frevio. If you disagree with these Terms, you must discontinue platform use immediately. If accessing on behalf of a company or studio, you affirm full legal authority to bind that entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">02.</span> Scope of Service
            </h2>
            <p>
              Frevio provides an integrated studio management operating system for freelancers, consultants, and independent agencies. Capabilities encompass project milestone management, client status portals, time tracking, invoice generation, contract agreements, and financial ledger settlements. We continuously iterate and introduce platform capabilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">03.</span> Account Integrity & Security
            </h2>
            <p>
              You are solely responsible for maintaining the confidentiality of your credentials and all actions conducted under your account. You represent that you are at least 18 years of age and will promptly notify our security team of any unauthorized workspace intrusion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">04.</span> Acceptable Studio Conduct
            </h2>
            <p>Users must adhere to legal and professional conduct. Under no circumstances may users:</p>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>Violate statutory laws, third-party copyrights, trademarks, or trade secrets;</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>Dispatch unsolicited bulk spam, deceptive communications, or fraudulent financial demands;</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>Attempt reverse-engineering, security probe penetration, or unauthorized database extraction;</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>Sub-license or commercially resell the platform architecture without written consent.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">05.</span> Subscriptions, Billing & Cancellations
            </h2>
            <p>
              Frevio provides Free tier access and premium Pro subscriptions. Paid tiers are billed on a recurring basis via Stripe and renew automatically until explicitly cancelled. Cancellations take effect at the conclusion of the active billing cycle. Payments are non-refundable except where mandated by applicable consumer protection laws. Promotional allocations may be adjusted or retired at platform discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">06.</span> Workspace Content & Intellectual Property
            </h2>
            <p>
              You maintain full, unencumbered ownership of all client deliverables, brand media, contracts, invoices, and documents uploaded to Frevio. You grant Frevio a restricted, worldwide license strictly to process, host, and render this data to execute your requested services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">07.</span> Account Termination
            </h2>
            <p>
              You may close your account at any time via Studio Settings. We reserve the authority to restrict or terminate workspace access in cases of material terms violations, chargeback abuse, or actionable legal liabilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">08.</span> Warranties & Liability Limitations
            </h2>
            <p>
              Frevio is provided &ldquo;as is&rdquo; without implied warranties of any kind. Under no theory of liability shall Frevio or its operators be liable for indirect, incidental, or consequential damages. Total cumulative liability shall not exceed the aggregate fees paid to Frevio in the 12 months preceding the claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">09.</span> Modifications to Terms
            </h2>
            <p>
              We reserve the right to revise these Terms to reflect legislative updates or product enhancements. Notice of significant revisions will be indicated through the effective date above. Continued platform utilization represents acceptance of modified terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">10.</span> Inquiries & Legal Notices
            </h2>
            <p>
              For legal communications, terms clarifications, or compliance documentation, reach out to{' '}
              <a href="mailto:support@frevio.app" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                support@frevio.app
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-6 text-xs text-slate-500 dark:text-slate-400">
          <span>Frevio Studio Operating System</span>
          <Link href="/privacy" className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  )
}
