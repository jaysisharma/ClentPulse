import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — Frevio',
}

const UPDATED = 'June 19, 2026'

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {UPDATED}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-3">
            <p>
              This policy explains what information Frevio (&ldquo;we&rdquo;) collects, how we use it, and the
              choices you have. By using Frevio you agree to this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">1. Information we collect</h2>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><strong>Account data</strong> — your name, email, and password (stored hashed by our auth provider).</li>
              <li><strong>Workspace data</strong> — the clients, projects, updates, invoices, contracts, and time entries you create.</li>
              <li><strong>Billing data</strong> — handled by Stripe; we store a customer ID and plan status, never full card numbers.</li>
              <li><strong>Usage data</strong> — basic logs needed to operate and secure the Service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">2. How we use it</h2>
            <p>
              We use your information to provide and improve the Service, process payments, send
              transactional email (verification codes, invoices, reminders, and digests), prevent abuse, and
              meet legal obligations. We do not sell your personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">3. Service providers</h2>
            <p>We share data only with vendors who help us run Frevio:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><strong>Supabase</strong> — database, authentication, and file storage.</li>
              <li><strong>Stripe</strong> — payment processing and subscription billing.</li>
              <li><strong>Resend</strong> — sending transactional email.</li>
              <li><strong>Our hosting provider</strong> — running the application servers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">4. Cookies</h2>
            <p>
              We use essential cookies to keep you signed in and to remember preferences such as theme. The
              &ldquo;Remember me&rdquo; option controls whether your session persists after you close the
              browser. We do not use third-party advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">5. Data retention</h2>
            <p>
              We keep your data while your account is active. If you delete your account, we remove your
              workspace data within a reasonable period, except where we must retain records (for example,
              invoices) to comply with law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">6. Security</h2>
            <p>
              We protect your data with encryption in transit, row-level access controls, and least-privilege
              access to credentials. No system is perfectly secure, but we work to safeguard your information
              and will notify you of incidents as required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">7. Your rights</h2>
            <p>
              You may access, correct, export, or delete your personal data. Email us and we will respond
              within a reasonable time. Depending on where you live, you may have additional rights under laws
              such as GDPR or CCPA.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">8. Contact</h2>
            <p>
              Privacy questions or requests? Email{' '}
              <a href="mailto:support@frevio.cloud" className="font-medium text-accent hover:underline">
                support@frevio.cloud
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
          <Link href="/terms" className="font-medium text-accent hover:underline">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}
