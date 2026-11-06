import type { Metadata } from 'next'
import { requireClientWorkspace } from '../client-context'
import { ProjectsView } from './projects-view'

export const metadata: Metadata = { title: 'Projects', robots: { index: false, follow: false } }

export default async function ClientProjectsPage() {
  const { email, workspace } = await requireClientWorkspace()
  return <ProjectsView email={email} workspace={workspace} />
}
