/**
 * Portfolio Auto-fill & Showcase Asset Generator
 * Allows freelancers/designers/engineers to select any existing project and automatically:
 * 1. Populate project title, client context, comprehensive case study, and category tags.
 * 2. Link live URLs, source repos, and walkthrough videos.
 * 3. Extract and generate showcase imagery (resource thumbnails, deliverable links, live snapshots, and branded studio artwork cards).
 */

export interface ExtractedWorkData {
  title: string
  clientName: string
  description: string
  liveUrl: string
  githubUrl: string
  videoUrl: string
  tags: string[]
  images: Array<{
    url: string
    title: string
    source: 'resource' | 'approval' | 'snapshot' | 'artwork'
  }>
}

/**
 * Generates an SVG Data URI showcasing the project with modern, luxury studio aesthetics.
 * Self-contained, ultra high-res, works offline and in any <img> tag or storage upload.
 */
export function generateStudioShowcaseSvg({
  projectName,
  clientName,
  accentColor = '#6366F1',
  kpis = [],
  tags = [],
}: {
  projectName: string
  clientName: string
  accentColor?: string
  kpis?: Array<{ label: string; value: string }>
  tags?: string[]
}): string {
  const safeTitle = (projectName || 'Studio Project')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  const safeClient = (clientName || 'Client Showcase')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  const displayKpis = kpis.slice(0, 3)
  const displayTags = tags.slice(0, 4)

  const kpisXml = displayKpis.map((kpi, idx) => {
    const xPos = 80 + idx * 280
    return `
      <g transform="translate(${xPos}, 500)">
        <rect width="250" height="96" rx="16" fill="#13151D" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
        <text x="24" y="44" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" letter-spacing="0.08em" text-transform="uppercase">${kpi.label.replace(/&/g, '&amp;')}</text>
        <text x="24" y="78" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700">${kpi.value.replace(/&/g, '&amp;')}</text>
      </g>
    `
  }).join('')

  const tagsXml = displayTags.map((tag, idx) => {
    const offset = idx * 130
    return `
      <g transform="translate(${80 + offset}, 220)">
        <rect width="118" height="34" rx="17" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        <text x="59" y="21" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" text-anchor="middle">${tag.replace(/&/g, '&amp;')}</text>
      </g>
    `
  }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <radialGradient id="bgGlow" cx="20%" cy="20%" r="70%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#090A0F" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#050608" stop-opacity="1" />
    </radialGradient>
    <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.08)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
    </linearGradient>
    <linearGradient id="accentBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="675" fill="url(#bgGlow)" />

  <!-- Subtle Studio Grid -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
    <line x1="80" y1="0" x2="80" y2="675" />
    <line x1="1120" y1="0" x2="1120" y2="675" />
    <line x1="0" y1="120" x2="1200" y2="120" />
    <line x1="0" y1="460" x2="1200" y2="460" />
  </g>

  <!-- Studio Header Tag -->
  <g transform="translate(80, 75)">
    <circle cx="8" cy="8" r="5" fill="#10B981" />
    <text x="24" y="12" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="0.2em">VERIFIED STUDIO SHOWCASE • FREVIO</text>
  </g>

  <!-- Client Indicator -->
  <g transform="translate(80, 160)">
    <text x="0" y="0" fill="${accentColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" letter-spacing="0.25em" text-transform="uppercase">${safeClient}</text>
  </g>

  <!-- Tags -->
  ${tagsXml}

  <!-- Main Title -->
  <g transform="translate(80, 330)">
    <text x="0" y="0" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="700" letter-spacing="-0.03em">${safeTitle}</text>
    <rect x="0" y="32" width="140" height="4" rx="2" fill="url(#accentBar)" />
  </g>

  <!-- KPI Badges -->
  ${kpisXml}

  <!-- Bottom Accent Stripe -->
  <rect x="0" y="669" width="1200" height="6" fill="url(#accentBar)" />
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * Extracts and synthesizes all project work details from Supabase tables
 */
export async function extractWorkDataFromProject(supabase: any, projectId: string): Promise<ExtractedWorkData | null> {
  try {
    const [
      { data: project },
      { data: milestones },
      { data: checklists },
      { data: updates },
      { data: approvals },
      { data: resources },
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('milestones').select('title, due_date, done').eq('project_id', projectId).order('created_at', { ascending: true }),
      supabase.from('checklist_items').select('title, done').eq('project_id', projectId).order('position', { ascending: true }),
      supabase.from('updates').select('bullets, note, video_url, created_at').eq('project_id', projectId).order('created_at', { ascending: false }).limit(5),
      supabase.from('approvals').select('title, url, preview_type, status').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('project_resources').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
    ])

    if (!project) return null

    const projectName = project.project_name || 'Project'
    const clientName = project.client_name || ''
    const accentColor = project.color || '#6366F1'

    // 1. Identify Live URL, Github URL, and Video URL
    let liveUrl = project.live_url || ''
    let githubUrl = ''
    let videoUrl = ''

    // If no direct project live_url, check approvals for live / staging
    if (!liveUrl && approvals && approvals.length > 0) {
      const stagingApproval = approvals.find((a: any) => a.url && (a.preview_type === 'staging' || a.preview_type === 'landing_page'))
      if (stagingApproval?.url) liveUrl = stagingApproval.url

      const figmaApproval = approvals.find((a: any) => a.url && a.preview_type === 'figma')
      if (figmaApproval?.url && !liveUrl) liveUrl = figmaApproval.url

      const codeApproval = approvals.find((a: any) => a.url && a.preview_type === 'code_pr')
      if (codeApproval?.url) githubUrl = codeApproval.url
    }

    // Check project report_embed_url
    if (!liveUrl && project.report_embed_url) {
      liveUrl = project.report_embed_url
    }

    // Check resources
    if (resources && resources.length > 0) {
      const gitResource = resources.find((r: any) => r.provider === 'github' || r.resource_type === 'repo' || (r.external_url && r.external_url.includes('github.com')))
      if (gitResource?.external_url) githubUrl = gitResource.external_url

      const figmaResource = resources.find((r: any) => r.provider === 'figma' || (r.external_url && r.external_url.includes('figma.com')))
      if (!liveUrl && figmaResource?.external_url) liveUrl = figmaResource.external_url

      const driveResource = resources.find((r: any) => r.provider === 'google_drive' || r.resource_type === 'file')
      if (!liveUrl && driveResource?.external_url) liveUrl = driveResource.external_url
    }

    // Check updates for video URL
    if (updates && updates.length > 0) {
      const updateWithVideo = updates.find((u: any) => u.video_url && u.video_url.trim().length > 0)
      if (updateWithVideo?.video_url) videoUrl = updateWithVideo.video_url
    }

    // 2. Synthesize tags
    const tagSet = new Set<string>()
    const titleLower = projectName.toLowerCase()

    if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('brand') || titleLower.includes('figma')) {
      tagSet.add('UI/UX Design')
      tagSet.add('Figma')
    }
    if (titleLower.includes('web') || titleLower.includes('site') || titleLower.includes('landing') || titleLower.includes('saas') || titleLower.includes('next')) {
      tagSet.add('Web Development')
      tagSet.add('Next.js')
    }
    if (titleLower.includes('mobile') || titleLower.includes('ios') || titleLower.includes('android') || titleLower.includes('react native')) {
      tagSet.add('Mobile App')
    }
    if (titleLower.includes('ecommerce') || titleLower.includes('store') || titleLower.includes('shop') || titleLower.includes('stripe')) {
      tagSet.add('E-Commerce')
      tagSet.add('Stripe')
    }
    if (resources?.some((r: any) => r.provider === 'figma')) tagSet.add('Figma')
    if (resources?.some((r: any) => r.provider === 'github')) tagSet.add('Open Source')

    // Default tag if none
    if (tagSet.size === 0) {
      tagSet.add('Client Project')
      tagSet.add('Full-Cycle Delivery')
    }

    // 3. Synthesize Description / Case Study
    const descParts: string[] = []
    
    // Overview
    if (clientName) {
      descParts.push(`Client Case Study: Delivered for ${clientName}.`)
    }
    descParts.push(`Comprehensive delivery focusing on quality execution, seamless client collaboration, and modern performance standards.`)

    // Completed Deliverables / Milestones
    const doneMilestones = (milestones ?? []).filter((m: any) => m.done).map((m: any) => m.title)
    const doneChecklists = (checklists ?? []).filter((c: any) => c.done).map((c: any) => c.title)
    const combinedDeliverables = Array.from(new Set([...doneMilestones, ...doneChecklists]))

    if (combinedDeliverables.length > 0) {
      descParts.push(`\nKey Deliverables & Milestones Completed:\n${combinedDeliverables.slice(0, 6).map(d => `• ${d}`).join('\n')}`)
    }

    // Key Outcomes & KPIs
    if (project.kpis && Array.isArray(project.kpis) && project.kpis.length > 0) {
      descParts.push(`\nBusiness Outcomes & Metrics:\n${project.kpis.map((k: any) => `• ${k.label}: ${k.value}${k.trend ? ` (${k.trend})` : ''}`).join('\n')}`)
    }

    // Updates highlights
    if (updates && updates.length > 0) {
      const allBullets: string[] = []
      updates.forEach((u: any) => {
        if (Array.isArray(u.bullets)) {
          u.bullets.forEach((b: string) => {
            if (b && typeof b === 'string' && b.trim()) allBullets.push(b.trim())
          })
        }
      })
      if (allBullets.length > 0) {
        descParts.push(`\nHighlight Accomplishments:\n${allBullets.slice(0, 4).map(b => `• ${b}`).join('\n')}`)
      }
    }

    const description = descParts.join('\n')

    // 4. Extract Images & Generate Artwork
    const images: Array<{ url: string; title: string; source: 'resource' | 'approval' | 'snapshot' | 'artwork' }> = []

    // A. Check resources for thumbnails or image files
    if (resources && resources.length > 0) {
      for (const res of resources) {
        if (res.thumbnail_url && typeof res.thumbnail_url === 'string' && res.thumbnail_url.startsWith('http')) {
          images.push({
            url: res.thumbnail_url,
            title: `${res.name || 'Resource'} preview`,
            source: 'resource',
          })
        } else if (res.external_url && typeof res.external_url === 'string' && /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(res.external_url)) {
          images.push({
            url: res.external_url,
            title: `${res.name || 'Asset'} deliverable`,
            source: 'resource',
          })
        }
      }
    }

    // B. Check approvals for direct images
    if (approvals && approvals.length > 0) {
      for (const app of approvals) {
        if (app.url && typeof app.url === 'string' && /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(app.url)) {
          images.push({
            url: app.url,
            title: `${app.title || 'Approval'} asset`,
            source: 'approval',
          })
        }
      }
    }

    // C. Live snapshot if liveUrl is a standard web URL
    if (liveUrl && liveUrl.startsWith('http') && !liveUrl.includes('figma.com') && !liveUrl.includes('drive.google.com')) {
      const cleanUrl = liveUrl.split('?')[0]
      const snapshotUrl = `https://image.thum.io/get/width/1200/crop/800/${cleanUrl}`
      images.push({
        url: snapshotUrl,
        title: `${projectName} live snapshot`,
        source: 'snapshot',
      })
    }

    // D. Generate luxury Studio Artwork Card (always available, 0 network dependency)
    const studioArtwork = generateStudioShowcaseSvg({
      projectName,
      clientName,
      accentColor,
      kpis: Array.isArray(project.kpis) ? project.kpis : [],
      tags: Array.from(tagSet),
    })

    images.push({
      url: studioArtwork,
      title: `${projectName} Studio Showcase Card`,
      source: 'artwork',
    })

    return {
      title: clientName ? `${projectName} — ${clientName}` : projectName,
      clientName,
      description,
      liveUrl,
      githubUrl,
      videoUrl,
      tags: Array.from(tagSet),
      images,
    }
  } catch (err) {
    console.error('[Portfolio Autofill] Error extracting work data:', err)
    return null
  }
}

/**
 * SQL migration script for Supabase
 */
export const PORTFOLIO_MIGRATION_SQL = `-- Frevio Portfolio Setup Migration
-- Run in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create extension if not exists "uuid-ossp";

create table if not exists public.portfolio_items (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.users(id) on delete cascade not null,
  project_id    uuid references public.projects(id) on delete set null,
  title         text not null,
  description   text,
  live_url      text,
  github_url    text,
  video_url     text,
  screenshots   text[] not null default '{}',
  tags          text[] not null default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists portfolio_items_user_id_idx on public.portfolio_items (user_id);
create index if not exists portfolio_items_project_id_idx on public.portfolio_items (project_id);
create index if not exists portfolio_items_created_at_idx on public.portfolio_items (created_at desc);

alter table public.portfolio_items enable row level security;

drop policy if exists "Users manage own portfolio items" on public.portfolio_items;
create policy "Users manage own portfolio items" on public.portfolio_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Public can view portfolio items" on public.portfolio_items;
create policy "Public can view portfolio items" on public.portfolio_items
  for select using (true);

insert into storage.buckets (id, name, public)
values ('portfolio-screenshots', 'portfolio-screenshots', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view portfolio screenshots" on storage.objects;
create policy "Public can view portfolio screenshots" on storage.objects
  for select using (bucket_id = 'portfolio-screenshots');

drop policy if exists "Authenticated users can upload portfolio screenshots" on storage.objects;
create policy "Authenticated users can upload portfolio screenshots" on storage.objects
  for insert with check (bucket_id = 'portfolio-screenshots' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update their screenshots" on storage.objects;
create policy "Authenticated users can update their screenshots" on storage.objects
  for update using (bucket_id = 'portfolio-screenshots' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete their screenshots" on storage.objects;
create policy "Authenticated users can delete their screenshots" on storage.objects
  for delete using (bucket_id = 'portfolio-screenshots' and auth.role() = 'authenticated');

alter table public.users add column if not exists portfolio_bio text;

alter table public.projects add column if not exists live_url text;
`

/**
 * Updates a project's live website or app URL with resilient fallback
 */
export async function updateProjectLiveUrl(supabase: any, projectId: string, liveUrl: string): Promise<boolean> {
  if (!projectId) return false
  const cleanUrl = liveUrl.trim()
  try {
    const { error } = await supabase
      .from('projects')
      .update({ live_url: cleanUrl || null })
      .eq('id', projectId)

    if (error) {
      console.warn('[updateProjectLiveUrl] Failed to update project live_url:', error.message)
      // Fallback: check if we can update approvals or resources if live_url column is not present
      if (cleanUrl) {
        // Try creating or updating an approval deliverable so link is preserved
        await supabase.from('approvals').upsert({
          project_id: projectId,
          title: 'Live Website / App',
          url: cleanUrl,
          preview_type: 'staging',
          status: 'approved',
        }).select().maybeSingle()
      }
      return false
    }
    return true
  } catch (err) {
    console.warn('[updateProjectLiveUrl] Exception updating project live_url:', err)
    return false
  }
}

/**
 * LocalStorage fallback helpers for when public.portfolio_items is not yet created in Supabase
 */
const STORAGE_KEY = 'frevio_local_portfolio_items'

export function getLocalPortfolioItems(userId: string): any[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalPortfolioItem(userId: string, item: any): any {
  if (typeof window === 'undefined') return item
  try {
    const existing = getLocalPortfolioItems(userId)
    const id = item.id || `local_${Date.now()}`
    const updatedItem = {
      ...item,
      id,
      user_id: userId,
      created_at: item.created_at || new Date().toISOString(),
      _is_local: true,
    }
    const filtered = existing.filter(x => x.id !== id)
    filtered.unshift(updatedItem)
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(filtered))
    return updatedItem
  } catch (err) {
    console.error('Failed to save local portfolio item:', err)
    return item
  }
}

export function deleteLocalPortfolioItem(userId: string, id: string): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalPortfolioItems(userId)
    const filtered = existing.filter(x => x.id !== id)
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(filtered))
  } catch {}
}
