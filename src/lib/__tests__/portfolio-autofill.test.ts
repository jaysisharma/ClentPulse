import { describe, it, expect } from 'vitest'
import { generateStudioShowcaseSvg, extractWorkDataFromProject, PORTFOLIO_MIGRATION_SQL } from '../portfolio-autofill'

describe('Portfolio Autofill & Showcase Generator', () => {
  it('generates a valid SVG data URI with project title, client, and KPIs', () => {
    const svgData = generateStudioShowcaseSvg({
      projectName: 'Fintech Dashboard Redesign',
      clientName: 'Stripe Capital',
      accentColor: '#6366F1',
      kpis: [
        { label: 'Conversion Rate', value: '+42%' },
        { label: 'Load Time', value: '1.2s' },
      ],
      tags: ['Next.js', 'Tailwind', 'Stripe'],
    })

    expect(svgData).toContain('data:image/svg+xml;charset=utf-8,')
    expect(svgData).toContain('Fintech%20Dashboard%20Redesign')
    expect(svgData).toContain('Stripe%20Capital')
    expect(svgData).toContain('Conversion%20Rate')
    expect(svgData).toContain('%2B42%25')
  })

  it('escapes special characters safely in SVG', () => {
    const svgData = generateStudioShowcaseSvg({
      projectName: 'E-Commerce & Mobile <App>',
      clientName: 'R&D "Studio"',
    })

    const decoded = decodeURIComponent(svgData)
    expect(decoded).not.toContain('<App>')
    expect(decoded).toContain('&lt;App&gt;')
    expect(decoded).toContain('R&amp;D')
  })

  it('includes complete SQL migration script', () => {
    expect(PORTFOLIO_MIGRATION_SQL).toContain('create table if not exists public.portfolio_items')
    expect(PORTFOLIO_MIGRATION_SQL).toContain('portfolio-screenshots')
    expect(PORTFOLIO_MIGRATION_SQL).toContain('alter table public.portfolio_items enable row level security')
  })

  it('extracts project work details, deliverables, live URLs, and generates artwork', async () => {
    const mockSupabase = {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => {
              if (table === 'projects') {
                return {
                  data: {
                    id: 'proj_123',
                    project_name: 'AI Analytics Platform',
                    client_name: 'Nexus Corp',
                    color: '#6366F1',
                    kpis: [{ label: 'Query Speed', value: '4x faster' }],
                    report_embed_url: 'https://analytics.example.com',
                  },
                }
              }
              return { data: null }
            },
            order: () => ({
              limit: async () => ({
                data: [
                  {
                    bullets: ['Shipped v1 dashboard', 'Connected live databases'],
                    note: 'Sprint 2 completed',
                    video_url: 'https://loom.com/share/abc12345678',
                    created_at: '2026-09-01T00:00:00Z',
                  },
                ],
              }),
              async then(resolve: any) {
                if (table === 'milestones') {
                  resolve({
                    data: [
                      { title: 'Database Architecture', done: true },
                      { title: 'Frontend Dashboard', done: true },
                    ],
                  })
                } else if (table === 'checklist_items') {
                  resolve({
                    data: [
                      { title: 'Production Deployment', done: true },
                    ],
                  })
                } else if (table === 'approvals') {
                  resolve({
                    data: [
                      {
                        title: 'Staging Demo',
                        url: 'https://staging.nexus-corp.app',
                        preview_type: 'staging',
                      },
                    ],
                  })
                } else if (table === 'project_resources') {
                  resolve({
                    data: [
                      {
                        name: 'Figma System',
                        thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8',
                        provider: 'figma',
                      },
                      {
                        name: 'GitHub Repository',
                        external_url: 'https://github.com/nexus/platform',
                        provider: 'github',
                      },
                    ],
                  })
                } else {
                  resolve({ data: [] })
                }
              },
            }),
          }),
        }),
      }),
    }

    const workData = await extractWorkDataFromProject(mockSupabase as any, 'proj_123')
    expect(workData).not.toBeNull()
    expect(workData?.title).toBe('AI Analytics Platform — Nexus Corp')
    expect(workData?.clientName).toBe('Nexus Corp')
    expect(workData?.liveUrl).toBe('https://staging.nexus-corp.app')
    expect(workData?.githubUrl).toBe('https://github.com/nexus/platform')
    expect(workData?.videoUrl).toBe('https://loom.com/share/abc12345678')
    expect(workData?.description).toContain('Database Architecture')
    expect(workData?.description).toContain('Query Speed: 4x faster')
    expect(workData?.images.length).toBeGreaterThanOrEqual(3)

    // Verify images include resource thumbnail, live snapshot, and generated studio artwork
    const sources = workData?.images.map(img => img.source)
    expect(sources).toContain('resource')
    expect(sources).toContain('snapshot')
    expect(sources).toContain('artwork')
  })
})
