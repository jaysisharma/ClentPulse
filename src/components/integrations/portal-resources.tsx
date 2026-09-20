import { FileText, Folder, GitPullRequest, Image, ExternalLink, Calendar, Clock, AlertTriangle } from 'lucide-react'

interface Resource {
  id: string
  provider: string
  resource_type: string
  external_id: string
  external_url: string | null
  name: string
  thumbnail_url: string | null
  show_in_portal: boolean
  metadata: Record<string, any>
  integration_connections?: { status: string } | null
}

interface Props {
  resources: Resource[]
  accentColor: string
}

function FileIcon({ mimeType, provider, resourceType }: { mimeType?: string; provider: string; resourceType: string }) {
  if (resourceType === 'folder') return <Folder className="w-4 h-4 flex-shrink-0" />
  if (provider === 'github') return <GitPullRequest className="w-4 h-4 flex-shrink-0" />
  if (provider === 'figma') return <Image className="w-4 h-4 flex-shrink-0" />
  return <FileText className="w-4 h-4 flex-shrink-0" />
}

function ResourceRow({ resource, accentColor }: { resource: Resource; accentColor: string }) {
  const isDisconnected = resource.integration_connections?.status !== 'active'

  return (
    <div className="flex items-center gap-3 py-2.5 group">
      <span className="text-slate-400 dark:text-slate-500">
        <FileIcon mimeType={resource.metadata?.mimeType} provider={resource.provider} resourceType={resource.resource_type} />
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-slate-800 dark:text-slate-200 truncate block">{resource.name}</span>
        {isDisconnected && (
          <span className="flex items-center gap-1 text-[10px] text-yellow-600 dark:text-yellow-400 mt-0.5">
            <AlertTriangle className="w-3 h-3" />
            File access requires reconnection
          </span>
        )}
      </div>
      {resource.external_url && !isDisconnected && (
        <a
          href={resource.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-white/30 transition-colors"
          aria-label={`Open ${resource.name}`}
        >
          Open
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

function formatEventDate(start: { dateTime?: string; date?: string }) {
  if (start.dateTime) {
    return new Date(start.dateTime).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  }
  if (start.date) {
    return new Date(start.date + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    })
  }
  return ''
}

export function PortalResources({ resources, accentColor }: Props) {
  const portalResources = resources.filter(r => r.show_in_portal)

  const driveFiles = portalResources.filter(r => r.provider === 'google_drive')
  const calendarEvents = portalResources.filter(r => r.provider === 'google_calendar')
  const githubRepos = portalResources.filter(r => r.provider === 'github')
  const figmaFiles = portalResources.filter(r => r.provider === 'figma')

  const hasAny = driveFiles.length > 0 || calendarEvents.length > 0 || githubRepos.length > 0 || figmaFiles.length > 0
  if (!hasAny) return null

  return (
    <div className="space-y-6">
      {/* Google Drive Files */}
      {driveFiles.length > 0 && (
        <section aria-labelledby="portal-files-heading">
          <h2
            id="portal-files-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3"
          >
            Project Files
          </h2>
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 px-4">
            {driveFiles.map(r => (
              <ResourceRow key={r.id} resource={r} accentColor={accentColor} />
            ))}
          </div>
        </section>
      )}

      {/* Google Calendar Events */}
      {calendarEvents.length > 0 && (
        <section aria-labelledby="portal-schedule-heading">
          <h2
            id="portal-schedule-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3"
          >
            Upcoming
          </h2>
          <div className="space-y-2">
            {calendarEvents.map(r => {
              const event = r.metadata?.event || {}
              const dateStr = event.start ? formatEventDate(event.start) : null
              const meetLink = event.hangoutLink || event.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 h-full min-h-[2.5rem] rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: accentColor }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{r.name}</p>
                      {dateStr && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {dateStr}
                        </p>
                      )}
                    </div>
                  </div>
                  {meetLink && (
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-white transition-colors"
                      style={{ backgroundColor: accentColor }}
                      aria-label="Join meeting"
                    >
                      Join
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* GitHub — client-friendly view */}
      {githubRepos.length > 0 && (
        <section aria-labelledby="portal-dev-heading">
          <h2
            id="portal-dev-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3"
          >
            Development
          </h2>
          <div className="space-y-2">
            {githubRepos.map(r => {
              const prs: any[] = r.metadata?.prs ?? []
              const isDisconnected = r.integration_connections?.status !== 'active'

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">{r.name}</span>
                    </div>
                    {r.external_url && (
                      <a
                        href={r.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-0.5 transition-colors"
                        aria-label="View repository"
                      >
                        View
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>

                  {isDisconnected ? (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Development updates temporarily unavailable
                    </p>
                  ) : prs.length === 0 ? (
                    <p className="text-xs text-slate-400">No open pull requests.</p>
                  ) : (
                    <ul className="space-y-2">
                      {prs.slice(0, 5).map((pr: any) => (
                        <li key={pr.number} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{pr.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                  pr.status === 'open'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : pr.status === 'merged'
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {pr.status === 'open' ? 'Ready for review' : pr.status === 'merged' ? 'Merged' : 'Closed'}
                              </span>
                              <span className="text-[10px] text-slate-400">#{pr.number}</span>
                            </div>
                          </div>
                          {pr.url && pr.status === 'open' && (
                            <a
                              href={pr.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-white/30 transition-colors"
                              aria-label={`View pull request ${pr.title}`}
                            >
                              View
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Figma Designs */}
      {figmaFiles.length > 0 && (
        <section aria-labelledby="portal-design-heading">
          <h2
            id="portal-design-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3"
          >
            Designs
          </h2>
          <div className="space-y-2">
            {figmaFiles.map(r => (
              <div
                key={r.id}
                className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
              >
                {r.thumbnail_url && (
                  <div className="aspect-video bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <img
                      src={r.thumbnail_url}
                      alt={r.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{r.name}</span>
                  {r.external_url && (
                    <a
                      href={r.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-white transition-colors"
                      style={{ backgroundColor: accentColor }}
                      aria-label={`Open ${r.name} in Figma`}
                    >
                      Open in Figma
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
