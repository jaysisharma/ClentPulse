import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'

// ── Tiny markdown renderer (handles only what FEATURES.md uses) ───────────────

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded text-[0.85em] font-mono">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 hover:underline">$1</a>')
    .replace(/✅/g, '<span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✅ Done</span>')
    .replace(/🔄/g, '<span class="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">🔄 In progress</span>')
    .replace(/⬜/g, '<span class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">⬜ Pending</span>')
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
      out.push('<hr class="border-slate-200 my-6" />')
      continue
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const content = renderInline(trimmed.slice(1).trim())
      out.push(`<blockquote class="border-l-4 border-indigo-300 pl-4 text-slate-500 text-sm italic my-3">${content}</blockquote>`)
      continue
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      out.push(`<h4 class="text-sm font-semibold text-slate-700 mt-4 mb-1">${renderInline(trimmed.slice(5))}</h4>`)
      continue
    }
    if (trimmed.startsWith('### ')) {
      out.push(`<h3 class="text-base font-bold text-slate-800 mt-6 mb-2 flex items-center gap-2">${renderInline(trimmed.slice(4))}</h3>`)
      continue
    }
    if (trimmed.startsWith('## ')) {
      out.push(`<h2 class="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">${renderInline(trimmed.slice(3))}</h2>`)
      continue
    }
    if (trimmed.startsWith('# ')) {
      out.push(`<h1 class="text-2xl font-bold text-slate-900 mb-1">${renderInline(trimmed.slice(2))}</h1>`)
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
        out.push('<div class="overflow-x-auto my-4"><table class="w-full text-sm border-collapse">')
        inTable = true
      }

      const tag = !tableHeader ? 'th' : 'td'
      const rowClass = !tableHeader
        ? 'bg-slate-50'
        : 'border-t border-slate-100 hover:bg-slate-50/60'
      const cellClass = !tableHeader
        ? 'px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'
        : 'px-4 py-2.5 align-top'

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
        out.push('<ul class="space-y-1.5 my-3 list-none">')
        inList = true
      }
      const content = renderInline(trimmed.slice(2))
      out.push(`<li class="flex items-start gap-2 text-sm text-slate-600"><span class="text-slate-300 mt-0.5 flex-shrink-0">–</span><span>${content}</span></li>`)
      continue
    }

    // Paragraph
    out.push(`<p class="text-sm text-slate-600 leading-relaxed">${renderInline(trimmed)}</p>`)
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

  const filePath = path.join(process.cwd(), 'FEATURES.md')
  const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '# FEATURES.md not found'
  const html = renderMarkdown(raw)

  return (
    <AppLayout>
      <div className="max-w-4xl animate-fade-in">
        <div
          className="prose-like"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </AppLayout>
  )
}
