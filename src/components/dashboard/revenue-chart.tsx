'use client'

import { useMemo, useState } from 'react'

type Point = { date: string; amount: number }

const RANGES = [
  { key: '7',   label: '7 Days',  days: 7,   unit: 'day' as const },
  { key: '30',  label: '30 Days', days: 30,  unit: 'day' as const },
  { key: '90',  label: '90 Days', days: 90,  unit: 'week' as const },
  { key: '365', label: 'Year',    days: 365, unit: 'month' as const },
]

const REV_COLOR = '#059669' // emerald-600 · positive (money in)
const EXP_COLOR = '#e11d48' // rose-600 · danger (money out)

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

type Bucket = { label: string; rev: number; exp: number }

function buildBuckets(paid: Point[], expenses: Point[], cfg: (typeof RANGES)[number]): Bucket[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (cfg.unit === 'month') {
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1)
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }), rev: 0, exp: 0 }
    })
    const idx = (s: string) => { const d = new Date(s); return `${d.getFullYear()}-${d.getMonth()}` }
    paid.forEach(p => { const b = buckets.find(b => b.key === idx(p.date)); if (b) b.rev += p.amount })
    expenses.forEach(p => { const b = buckets.find(b => b.key === idx(p.date)); if (b) b.exp += p.amount })
    return buckets
  }

  const bucketDays = cfg.unit === 'week' ? 7 : 1
  const count = Math.ceil(cfg.days / bucketDays)
  const start = new Date(today)
  start.setDate(today.getDate() - (count * bucketDays - 1))

  const buckets: Bucket[] = Array.from({ length: count }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i * bucketDays)
    const label =
      cfg.unit === 'week'
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : d.toLocaleDateString('en-US', cfg.days <= 7 ? { weekday: 'short' } : { month: 'short', day: 'numeric' })
    return { label, rev: 0, exp: 0 }
  })

  const place = (pts: Point[], field: 'rev' | 'exp') => {
    pts.forEach(p => {
      const d = new Date(p.date)
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const di = Math.floor((day.getTime() - start.getTime()) / 86_400_000)
      if (di < 0) return
      const bi = Math.floor(di / bucketDays)
      if (bi >= 0 && bi < buckets.length) buckets[bi][field] += p.amount
    })
  }
  place(paid, 'rev')
  place(expenses, 'exp')
  return buckets
}

// Map a bucket value into the 0–100 SVG box. Top 6% / bottom 4% are breathing room.
const yPct = (v: number, max: number) => 6 + (1 - v / max) * 90
const xPct = (i: number, n: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100)

function linePath(values: number[], max: number) {
  const n = values.length
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPct(i, n).toFixed(2)} ${yPct(v, max).toFixed(2)}`).join(' ')
}

function areaPath(values: number[], max: number) {
  const n = values.length
  const top = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPct(i, n).toFixed(2)} ${yPct(v, max).toFixed(2)}`).join(' ')
  return `${top} L ${xPct(n - 1, n).toFixed(2)} 100 L ${xPct(0, n).toFixed(2)} 100 Z`
}

export function RevenueChart({ paid, expenses }: { paid: Point[]; expenses: Point[] }) {
  const [rangeKey, setRangeKey] = useState('30')
  const [hover, setHover] = useState<number | null>(null)
  const cfg = RANGES.find(r => r.key === rangeKey)!

  const buckets = useMemo(() => buildBuckets(paid, expenses, cfg), [paid, expenses, cfg])
  const totalRev = buckets.reduce((s, b) => s + b.rev, 0)
  const totalExp = buckets.reduce((s, b) => s + b.exp, 0)
  const net = totalRev - totalExp
  const max = Math.max(...buckets.map(b => Math.max(b.rev, b.exp)), 1)
  const n = buckets.length
  const labelEvery = Math.ceil(n / 7)
  const empty = totalRev === 0 && totalExp === 0

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Money in vs out</h2>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className={`text-3xl font-bold tabular-nums ${net >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>{fmt$(net)}</span>
            <span className="text-sm font-medium text-slate-400">net</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REV_COLOR }} />
              {fmt$(totalRev)} <span className="text-slate-400">in</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EXP_COLOR }} />
              {fmt$(totalExp)} <span className="text-slate-400">out</span>
            </span>
          </div>
        </div>

        {/* Range tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRangeKey(r.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                rangeKey === r.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {empty ? (
        <div className="h-56 flex items-center justify-center text-sm text-slate-400 font-medium">No money in or out in this period yet.</div>
      ) : (
        <>
          {/* Plot */}
          <div className="relative h-56 w-full" onMouseLeave={() => setHover(null)}>
            {/* gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-dashed border-slate-100" />)}
              <div className="border-t border-slate-200" />
            </div>

            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={REV_COLOR} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={REV_COLOR} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={EXP_COLOR} stopOpacity="0.12" />
                  <stop offset="100%" stopColor={EXP_COLOR} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath(buckets.map(b => b.exp), max)} fill="url(#expFill)" />
              <path d={areaPath(buckets.map(b => b.rev), max)} fill="url(#revFill)" />
              <path d={linePath(buckets.map(b => b.exp), max)} fill="none" stroke={EXP_COLOR} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              <path d={linePath(buckets.map(b => b.rev), max)} fill="none" stroke={REV_COLOR} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>

            {/* hover layer + dots */}
            <div className="absolute inset-0 flex">
              {buckets.map((b, i) => (
                <div
                  key={i}
                  className="relative flex-1 h-full"
                  onMouseEnter={() => setHover(i)}
                >
                  {hover === i && (
                    <>
                      <div className="absolute top-0 bottom-0 w-px bg-slate-200" style={{ left: `${xPct(i, n)}%` }} />
                      {(['rev', 'exp'] as const).map(k => (
                        <div
                          key={k}
                          className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-sm -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${xPct(i, n)}%`, top: `${yPct(b[k], max)}%`, border: `2px solid ${k === 'rev' ? REV_COLOR : EXP_COLOR}` }}
                        />
                      ))}
                      <div
                        className="absolute z-10 -translate-x-1/2 -top-1 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-white shadow-xl pointer-events-none"
                        style={{ left: `${Math.min(Math.max(xPct(i, n), 12), 88)}%` }}
                      >
                        <div className="font-semibold text-slate-300 mb-1">{b.label}</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: REV_COLOR }} /> {fmt$(b.rev)} in</div>
                        <div className="flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: EXP_COLOR }} /> {fmt$(b.exp)} out</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* x-axis labels */}
          <div className="flex mt-2">
            {buckets.map((b, i) => (
              <span key={i} className="flex-1 text-[10px] text-slate-400 font-semibold text-center truncate">
                {i % labelEvery === 0 ? b.label : ''}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
