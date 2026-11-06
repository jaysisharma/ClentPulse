import type { Metadata } from 'next'
import { requireClientWorkspace } from '../client-context'
import { BillingView } from './billing-view'

export const metadata: Metadata = { title: 'Billing', robots: { index: false, follow: false } }

export default async function ClientBillingPage() {
  const { email, workspace } = await requireClientWorkspace()
  return <BillingView email={email} workspace={workspace} />
}
