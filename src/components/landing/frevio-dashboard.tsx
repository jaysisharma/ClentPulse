import { LayoutDashboard, FolderKanban, FileText, Clock, Users, Settings } from 'lucide-react'

const ACCENT = '#6C4CFD'

// Contained dark dashboard mockup — the premium "screenshot" used in the hero
// and product showcase. Pure CSS, no image. Static (no client JS).
export function FrevioDashboard({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-[#0B0B12] ring-1 ring-white/10 ${className}`}>
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="ml-3 rounded-md bg-white/[0.04] px-3 py-1 text-[10px] font-medium text-white/40">
          frevio.cloud/dashboard
        </div>
      </div>

      <div className="flex">
        {/* sidebar */}
        <div className="hidden w-44 flex-shrink-0 flex-col gap-1 border-r border-white/5 p-3 sm:flex">
          <div className="mb-3 flex items-center gap-2 px-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: ACCENT }}>
              <span className="h-2.5 w-2.5 rounded-sm bg-white" />
            </span>
            <span className="text-[13px] font-semibold text-white">Frevio</span>
          </div>
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: FolderKanban, label: 'Projects' },
            { icon: Users, label: 'Clients' },
            { icon: FileText, label: 'Invoices' },
            { icon: Clock, label: 'Time' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] ${
                active ? 'bg-white/[0.06] font-semibold text-white' : 'text-white/45'
              }`}
            >
              <Icon className="h-3.5 w-3.5" style={active ? { color: ACCENT } : undefined} />
              {label}
            </div>
          ))}
        </div>

        {/* main */}
        <div className="min-w-0 flex-1 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold text-white">Welcome back, Jordan</div>
              <div className="text-[11px] text-white/40">3 active projects · 2 need attention</div>
            </div>
            <div className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white" style={{ background: ACCENT }}>
              New project
            </div>
          </div>

          {/* metrics */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Outstanding', value: '$4,850', tint: '#F43F5E' },
              { label: 'This month', value: '$12,300', tint: '#34D399' },
              { label: 'Hours / week', value: '24h 10m', tint: '#FFFFFF' },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-wide text-white/35">{m.label}</div>
                <div className="mt-1 text-[17px] font-bold" style={{ color: m.tint }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* list */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="border-b border-white/5 px-4 py-2.5 text-[11px] font-semibold text-white/70">Projects</div>
            {[
              { name: 'Acme Website Redesign', client: 'Acme Corp', dot: ACCENT, status: 'On track' },
              { name: 'Delta Mobile App', client: 'Delta Inc', dot: '#34D399', status: 'On track' },
              { name: 'Northwind Brand', client: 'Northwind', dot: '#F59E0B', status: 'Update due' },
            ].map((p, i) => (
              <div key={p.name} className={`flex items-center gap-3 px-4 py-3 ${i < 2 ? 'border-b border-white/5' : ''}`}>
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: p.dot }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-white">{p.name}</div>
                  <div className="text-[10px] text-white/35">{p.client}</div>
                </div>
                <div className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] font-medium text-white/50">{p.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
