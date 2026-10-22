import type { Metadata } from 'next'
import { DemoPortalClient } from './demo-portal-client'

export const metadata: Metadata = {
  title: { absolute: 'Try the client view | Frevio' },
  description: 'Experience the live client status portal that modern freelancers and design & development studios share with their clients. Test deliverable approvals, real-time developer presence, and milestone tracking.',
  alternates: { canonical: '/demo' },
  openGraph: {
    title: 'Try the client view | Frevio',
    description: 'Click through a live client portal: progress, deliverable approvals, file uploads and invoices. No signup needed.',
    url: '/demo',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Frevio client portal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Try the client view | Frevio',
    description: 'Click through a live client portal: progress, deliverable approvals, file uploads and invoices. No signup needed.',
    images: ['/og-image.png'],
  },
}

export default function DemoPage() {
  return <DemoPortalClient />
}
