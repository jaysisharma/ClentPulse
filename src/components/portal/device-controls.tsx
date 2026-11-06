'use client'

import { Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react'

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'
export type Orientation = 'portrait' | 'landscape'

/** Desktop / tablet / phone switcher (with rotate) shared by the portal's preview embeds. */
export function DeviceControls({
  deviceMode,
  orientation,
  onDeviceModeChange,
  onToggleOrientation,
}: {
  deviceMode: DeviceMode
  orientation: Orientation
  onDeviceModeChange: (mode: DeviceMode) => void
  onToggleOrientation: () => void
}) {
  return (
  <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
    <button
      onClick={() => onDeviceModeChange('desktop')}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
        deviceMode === 'desktop'
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
      title="Desktop View (100% Fluid)"
    >
      <Monitor className="w-3.5 h-3.5" />
      <span>Desktop</span>
    </button>

    <button
      onClick={() => onDeviceModeChange('tablet')}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
        deviceMode === 'tablet'
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
      title="Tablet View (768px)"
    >
      <Tablet className="w-3.5 h-3.5" />
      <span>Tablet</span>
    </button>

    <button
      onClick={() => onDeviceModeChange('mobile')}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
        deviceMode === 'mobile'
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
      title="Phone View (375px)"
    >
      <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
      <span>Phone</span>
    </button>

    {/* Orientation toggle when in phone or tablet */}
    {deviceMode !== 'desktop' && (
      <button
        onClick={onToggleOrientation}
        className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
        title={`Rotate to ${orientation === 'portrait' ? 'Landscape' : 'Portrait'}`}
      >
        <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
      </button>
    )}
  </div>
  )
}
