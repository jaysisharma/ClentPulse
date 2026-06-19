import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — Frevio',
}

const UPDATED = 'June 19, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Frevio
        </Link>

        <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {UPDATED}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">1. Acceptance of terms</h2>
            <p>
              By creating an account or using Frevio (the &ldquo;Service&rdquo;), you agree to these Terms of
              Service. If you do not agree, do not use the Service. If you use Frevio on behalf of an
              organization, you represent that you have authority to bind that organization to these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">2. The Service</h2>
            <p>
              Frevio is a client-management workspace for freelancers — projects, status updates, invoices,
              contracts, time tracking, and client portals. We may add, change, or remove features over time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">3. Accounts</h2>
            <p>
              You are responsible for safeguarding your login credentials and for all activity under your
              account. You must provide accurate information and be at least 18 years old. Notify us promptly
              of any unauthorized use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">4. Acceptable use</h2>
            <p>You agree not to misuse the Service. In particular, you will not:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>break the law or infringe others&rsquo; rights;</li>
              <li>send spam, malware, or fraudulent invoices;</li>
              <li>attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service;</li>
              <li>resell or expose the Service to third parties except your own clients.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">5. Plans, billing, and cancellation</h2>
            <p>
              Frevio offers a free plan and a paid <strong>Pro</strong> plan. Paid subscriptions are billed in
              advance through our payment processor, Stripe, and renew automatically until cancelled. You can
              cancel anytime; access continues until the end of the current billing period. Except where
              required by law, payments are non-refundable. Promotional offers (such as free launch access)
              may be limited in quantity, time, or eligibility and may be modified or ended at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">6. Your content</h2>
            <p>
              You retain ownership of the content and data you put into Frevio. You grant us a limited license
              to host and process it solely to operate the Service. You are responsible for the lawfulness of
              the content you upload and the messages and invoices you send to your clients.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">7. Termination</h2>
            <p>
              You may stop using Frevio at any time. We may suspend or terminate accounts that violate these
              terms or that we reasonably believe create risk or legal exposure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">8. Disclaimers &amp; limitation of liability</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent
              permitted by law, Frevio is not liable for indirect, incidental, or consequential damages, and our
              total liability for any claim will not exceed the amount you paid us in the 12 months before the
              claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">9. Changes</h2>
            <p>
              We may update these terms from time to time. Material changes will be reflected by the &ldquo;Last
              updated&rdquo; date above. Continued use after changes means you accept the revised terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">10. Contact</h2>
            <p>
              Questions about these terms? Email{' '}
              <a href="mailto:support@frevio.cloud" className="font-medium text-accent hover:underline">
                support@frevio.cloud
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
          <Link href="/privacy" className="font-medium text-accent hover:underline">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  )
}
