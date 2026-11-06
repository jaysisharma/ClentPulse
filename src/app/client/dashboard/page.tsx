import { requireClientWorkspace } from '../client-context'
import { ClientDashboardView } from './dashboard-view'

export default async function ClientDashboardPage() {
  const { email, fullName, workspace } = await requireClientWorkspace()
  return <ClientDashboardView email={email} fullName={fullName} workspace={workspace} />
}
