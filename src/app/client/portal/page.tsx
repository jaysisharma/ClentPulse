import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowUpRight, ShieldCheck, Lock, Globe, Building2, Search } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers()
  const customDomain = headerList.get('x-custom-domain')

  if (customDomain) {
    const supabase = await createClient()
    const { data: org } = await supabase
      .from('organizations')
      .select('name, logo_url, favicon_url')
      .eq('custom_domain', customDomain)
      .maybeSingle()

    if (org) {
      return {
        title: `${org.name} — Client Portal`,
        description: `Secure client portal for ${org.name}. Access deliverables, milestone reviews, and project status.`,
        icons: org.favicon_url ? { icon: org.favicon_url } : undefined,
      }
    }
  }

  return {
    title: 'Client Portal Hub',
    description: 'Access your dedicated project status page, milestones, and invoice sign-offs.',
  }
}

export default async function ClientPortalHubPage() {
  const headerList = await headers()
  const customDomain = headerList.get('x-custom-domain')
  const supabase = await createClient()

  let org: any = null
  let projects: any[] = []

  if (customDomain) {
    const { data: foundOrg } = await supabase
      .from('organizations')
      .select('id, name, slug, logo_url, favicon_url, accent_color, white_label, custom_domain')
      .eq('custom_domain', customDomain)
      .maybeSingle()

    if (foundOrg) {
      org = foundOrg
      const { data: orgProjects } = await supabase
        .from('projects')
        .select('id, project_name, client_name, slug, color, status, passcode')
        .eq('org_id', foundOrg.id)
        .order('created_at', { ascending: false })
      
      projects = orgProjects || []
    }
  }

  const brandName = org?.name || 'Client Portal Hub'
  const brandLogo = org?.logo_url || null
  const accentColor = org?.accent_color || '#6366f1'

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/20">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full blur-[140px] opacity-15"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_30%,transparent_80%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-white/5 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="h-8 w-8 rounded-lg object-contain bg-white/5 p-1 border border-white/10"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                style={{ backgroundColor: accentColor }}
              >
                {brandName.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-sm text-white tracking-tight">{brandName}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure Portal</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-xl mx-auto w-full">
        <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 mb-6 shadow-xl ring-1 ring-white/5">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
          Welcome to <span className="font-medium text-white">{brandName}</span>
        </h1>
        <p className="mt-3 text-sm text-slate-400 font-light leading-relaxed max-w-md">
          Access your active milestones, review deliverables, track live progress, and manage sign-offs.
        </p>

        {/* Client Access Box */}
        <div className="mt-8 w-full rounded-2xl border border-white/10 bg-[#0e1017]/90 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 text-left">
          <label htmlFor="project-search" className="block text-xs font-medium text-slate-300 mb-2">
            Enter your project access link or slug
          </label>
          <form
            action="/client/portal-redirect"
            method="GET"
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="project-search"
                name="slug"
                type="text"
                required
                placeholder="e.g. acme-rebrand"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-black/40 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Access</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* If the org has public projects listed, show them */}
          {projects.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Active Client Portals
              </div>
              <div className="space-y-2">
                {projects.map((proj) => (
                  <Link
                    key={proj.id}
                    href={`/p/${proj.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
                        {proj.project_name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {proj.client_name ? `Client: ${proj.client_name}` : 'Portal'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {proj.passcode && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          Passcode
                        </span>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</span>
          <span className="font-mono text-[11px]">256-bit SSL Encrypted</span>
        </div>
      </footer>
    </div>
  )
}
