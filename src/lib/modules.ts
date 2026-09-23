import type { UserCraft, WorkspaceModules } from '@/types'

export const DEFAULT_MODULES: Required<WorkspaceModules> = {
  marketing: true,
  developer: true,
  design: true,
  time_tracking: true,
  contracts_billing: true,
}

export const CRAFT_PRESETS: Record<UserCraft, Required<WorkspaceModules>> = {
  developer: {
    developer: true,
    time_tracking: true,
    contracts_billing: true,
    design: false,
    marketing: false,
  },
  marketer: {
    marketing: true,
    time_tracking: true,
    contracts_billing: true,
    design: false,
    developer: false,
  },
  designer: {
    design: true,
    time_tracking: true,
    contracts_billing: true,
    developer: false,
    marketing: false,
  },
  consultant: {
    contracts_billing: true,
    time_tracking: true,
    developer: false,
    marketing: false,
    design: false,
  },
  general: {
    marketing: true,
    developer: true,
    design: true,
    time_tracking: true,
    contracts_billing: true,
  },
}

export interface ModuleInfo {
  id: keyof WorkspaceModules
  name: string
  shortDescription: string
  fullDescription: string
  iconName: string
  badge?: string
}

export const MODULE_CATALOG: ModuleInfo[] = [
  {
    id: 'marketing',
    name: 'Performance & Marketing Suite',
    shortDescription: 'Campaign KPIs, Looker Studio embeds & ad blockers',
    fullDescription: 'Custom KPI snapshot cards (ROAS, CPA, Leads), embedded Looker Studio & Google Sheets reports, and marketing-specific client blockers.',
    iconName: 'BarChart3',
    badge: 'Popular',
  },
  {
    id: 'developer',
    name: 'Developer Telemetry & IDE Sync',
    shortDescription: 'VS Code heartbeat, live coding presence & PR reviews',
    fullDescription: 'VS Code and Antigravity editor integration, automated time tracking, live coding pulse on client portals, and code PR approvals.',
    iconName: 'Code2',
  },
  {
    id: 'design',
    name: 'Creative & Design Reviews',
    shortDescription: 'Figma prototypes, asset packages & visual mockups',
    fullDescription: 'Figma prototype inspections, downloadable asset zip deliverables, and visual review workflows.',
    iconName: 'Palette',
  },
  {
    id: 'time_tracking',
    name: 'Time Tracking & Transparency',
    shortDescription: 'Live timer, manual hour logs & dedicated time transparency',
    fullDescription: 'Project timers, manual hourly logging, billable rate calculations, and client portal time visibility.',
    iconName: 'Clock',
  },
  {
    id: 'contracts_billing',
    name: 'Contracts & Retainer Deposits',
    shortDescription: 'E-signatures, deposit gates & multi-currency billing',
    fullDescription: 'Scope contracts with e-signatures, upfront deposit gates that unlock project kickoffs, and multi-currency Stripe checkout.',
    iconName: 'FileCheck',
  },
]

/**
 * Resolves user modules with safe fallbacks.
 * If user has not configured modules or a key is omitted, it defaults to true.
 */
export function resolveModules(input?: WorkspaceModules | null): Required<WorkspaceModules> {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_MODULES }
  }

  return {
    marketing: input.marketing !== undefined ? Boolean(input.marketing) : DEFAULT_MODULES.marketing,
    developer: input.developer !== undefined ? Boolean(input.developer) : DEFAULT_MODULES.developer,
    design: input.design !== undefined ? Boolean(input.design) : DEFAULT_MODULES.design,
    time_tracking: input.time_tracking !== undefined ? Boolean(input.time_tracking) : DEFAULT_MODULES.time_tracking,
    contracts_billing: input.contracts_billing !== undefined ? Boolean(input.contracts_billing) : DEFAULT_MODULES.contracts_billing,
  }
}
