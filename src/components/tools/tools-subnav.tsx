'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, FileText, ShieldAlert } from 'lucide-react'

const TOOLS = [
  {
    href: '/calculator',
    label: 'Rate Calculator',
    icon: Calculator,
    tag: 'Pricing',
  },
  {
    href: '/calculator/invoice-generator',
    label: 'Free Invoice Generator',
    icon: FileText,
    tag: 'PDF & Print',
  },
  {
    href: '/calculator/scope-creep',
    label: 'Scope Creep Estimator',
    icon: ShieldAlert,
    tag: 'Change Orders',
  },
]

export function ToolsSubnav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-center mb-10 overflow-x-auto py-1 px-2 no-scrollbar">
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full border border-white/10 bg-[#0e1017]/90 backdrop-blur-xl ring-1 ring-white/5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isActive = pathname === tool.href
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tool.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive
                    ? 'bg-indigo-500/30 text-indigo-100'
                    : 'bg-white/5 text-slate-500'
                }`}
              >
                {tool.tag}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
