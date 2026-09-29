import type { Metadata } from 'next'
import { DemoPortalClient } from './demo-portal-client'

export const metadata: Metadata = {
  title: 'Interactive Client Portal Demo | Frevio',
  description: 'Experience the live client status portal that modern freelancers and design & development studios share with their clients. Test deliverable approvals, real-time developer presence, and milestone tracking.',
  openGraph: {
    title: 'Interactive Client Portal Demo | Frevio',
    description: 'Explore the live client status portal with developer telemetry, deposit gates, and deliverable sign-offs.',
    type: 'website',
  },
}

export default function DemoPage() {
  return <DemoPortalClient />
}
