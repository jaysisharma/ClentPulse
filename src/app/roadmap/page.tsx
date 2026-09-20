import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { RoadmapClient } from './roadmap-client'

// ── Tiny markdown renderer (handles only what FEATURES.md uses) ───────────────

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-slate-200/60 dark:border-white/10">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 dark:text-indigo-400 underline underline-offset-4 hover:opacity-80 transition-opacity">$1</a>')
    .replace(/✅/g, '<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">✅ Done</span>')
    .replace(/🔄/g, '<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">🔄 In progress</span>')
    .replace(/⬜/g, '<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full">⬜ Planned</span>')
    .replace(/📋/g, '📋')
}

function renderMarkdown(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let inTable = false
  let inList = false
  let tableHeader = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Close list if leaving it
    if (inList && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      out.push('</ul>')
      inList = false
    }

    // Close table if leaving it
    if (inTable && !trimmed.startsWith('|')) {
      out.push('</tbody></table></div>')
      inTable = false
      tableHeader = false
    }

    if (!trimmed) {
      out.push('<div class="h-2" />')
      continue
    }

    // HR
    if (/^---+$/.test(trimmed)) {
      out.push('<hr class="border-slate-200 dark:border-white/10 my-6" />')
      continue
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const content = renderInline(trimmed.slice(1).trim())
      out.push(`<blockquote class="border-l-2 border-indigo-500 pl-4 text-slate-600 dark:text-slate-400 text-xs italic my-3 bg-indigo-50/30 dark:bg-indigo-500/5 py-2 rounded-r-xl">${content}</blockquote>`)
      continue
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      out.push(`<h4 class="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mt-4 mb-1">${renderInline(trimmed.slice(5))}</h4>`)
      continue
    }
    if (trimmed.startsWith('### ')) {
      out.push(`<h3 class="text-sm font-semibold text-slate-900 dark:text-white mt-6 mb-2 flex items-center gap-2">${renderInline(trimmed.slice(4))}</h3>`)
      continue
    }
    if (trimmed.startsWith('## ')) {
      out.push(`<h2 class="text-base font-medium uppercase tracking-tight text-slate-900 dark:text-white mt-8 mb-3 pb-2 border-b border-slate-200 dark:border-white/10">${renderInline(trimmed.slice(3))}</h2>`)
      continue
    }
    if (trimmed.startsWith('# ')) {
      out.push(`<h1 class="text-xl font-light uppercase tracking-tight text-slate-900 dark:text-white mb-2">${renderInline(trimmed.slice(2))}</h1>`)
      continue
    }

    // Table
    if (trimmed.startsWith('|')) {
      const cells = trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1)

      // separator row (|---|---|)
      if (cells.every(c => /^[-: ]+$/.test(c))) {
        tableHeader = true
        continue
      }

      if (!inTable) {
        out.push('<div class="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-white/10"><table class="w-full text-xs border-collapse">')
        inTable = true
      }

      const tag = !tableHeader ? 'th' : 'td'
      const rowClass = !tableHeader
        ? 'bg-slate-50 dark:bg-white/[0.03]'
        : 'border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
      const cellClass = !tableHeader
        ? 'px-4 py-3 text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'
        : 'px-4 py-3 align-top text-slate-700 dark:text-slate-300'

      if (!tableHeader) {
        out.push('<thead>')
      } else if (tableHeader && out[out.length - 1]?.includes('<thead>')) {
        out.push('</thead><tbody>')
      }

      const row = cells.map(c =>
        `<${tag} class="${cellClass}">${renderInline(c.trim())}</${tag}>`
      ).join('')
      out.push(`<tr class="${rowClass}">${row}</tr>`)
      continue
    }

    // List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        out.push('<ul class="space-y-2 my-3 list-none">')
        inList = true
      }
      const content = renderInline(trimmed.slice(2))
      out.push(`<li class="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" /><span>${content}</span></li>`)
      continue
    }

    // Paragraph
    out.push(`<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">${renderInline(trimmed)}</p>`)
  }

  if (inList)  out.push('</ul>')
  if (inTable) out.push('</tbody></table></div>')

  return out.join('\n')
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RoadmapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()

  // 1. Fetch live feature requests from freelancer_feedback
  const { data: feedbackData, error: feedbackError } = await adminClient
    .from('freelancer_feedback')
    .select('id, subject, comment, rating, votes, status, created_at')
    .eq('category', 'feature_request')
    .order('votes', { ascending: false })

  if (feedbackError) {
    console.error('[Roadmap Page] Fetch Feedback error:', feedbackError)
  }

  const suggestions = (feedbackData || []).map(item => ({
    id: item.id,
    subject: item.subject || 'Feature Suggestion',
    comment: item.comment,
    rating: item.rating,
    votes: item.votes || 1,
    status: item.status as any,
    created_at: item.created_at,
  }))

  const filePath = path.join(process.cwd(), 'FEATURES.md')
  const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '# FEATURES.md not found'
  const html = renderMarkdown(raw)

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <RoadmapClient htmlSpecs={html} initialSuggestions={suggestions} />
      </div>
    </AppLayout>
  )
}
