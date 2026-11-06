import type { Metadata } from 'next'
import { requireClientWorkspace } from '../client-context'
import { UpdatesView } from './updates-view'

export const metadata: Metadata = { title: 'Updates', robots: { index: false, follow: false } }

export default async function ClientUpdatesPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const [{ email, workspace }, { project }] = await Promise.all([requireClientWorkspace(), searchParams])
  return <UpdatesView email={email} workspace={workspace} projectSlug={project} />
}
