'use client'

import { useState, useEffect } from 'react'
import {
  CurrencyConfig,
  SUPPORTED_CURRENCIES,
  getAllCurrencies,
  saveCustomCurrency,
  fmtCurrency,
} from '@/lib/currencies'
import { Plus, X, Globe, Check, Sparkles } from 'lucide-react'

interface CurrencySelectorProps {
  value: string
  onChange: (code: string) => void
  className?: string
  id?: string
}

export function CurrencySelector({
  value,
  onChange,
  className,
  id,
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([])
  const [showModal, setShowModal] = useState(false)
  const [customCode, setCustomCode] = useState('')
  const [customSymbol, setCustomSymbol] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [modalError, setModalError] = useState('')

  // Load standard + custom currencies from localStorage on mount
  useEffect(() => {
    setCurrencies(getAllCurrencies())
  }, [])

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === '__ADD_CUSTOM__') {
      setShowModal(true)
      return
    }
    onChange(val)
  }

  function handleSaveCustom(e: React.FormEvent) {
    e.preventDefault()
    setModalError('')

    const code = customCode.trim().toUpperCase()
    if (!code) {
      setModalError('Please enter a currency code (e.g. NPR, INR, KWD).')
      return
    }

    if (code.length < 2 || code.length > 6) {
      setModalError('Currency code should typically be 3-5 letters (e.g. NPR, INR, USDT).')
      return
    }

    const symbol = customSymbol.trim() || code
    const label = customLabel.trim() || `${code} (${symbol})`

    const newConfig: CurrencyConfig = {
      code,
      symbol,
      label,
      locale: 'en-US',
      isCustom: true,
    }

    saveCustomCurrency(newConfig)
    const updated = getAllCurrencies()
    setCurrencies(updated)
    onChange(code)

    // Reset and close
    setCustomCode('')
    setCustomSymbol('')
    setCustomLabel('')
    setShowModal(false)
  }

  const primaryCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'NPR', 'CAD', 'AUD']
  const primaryList = currencies.filter(c => primaryCurrencies.includes(c.code) && !c.isCustom)
  const customList = currencies.filter(c => c.isCustom)
  const otherList = currencies.filter(c => !primaryCurrencies.includes(c.code) && !c.isCustom)

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={handleSelectChange}
        className={
          className ||
          'rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#0c0d12] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono'
        }
      >
        <optgroup label="Popular & Featured">
          {primaryList.map(c => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </optgroup>

        {customList.length > 0 && (
          <optgroup label="Custom Added Currencies">
            {customList.map(c => (
              <option key={c.code} value={c.code}>
                ★ {c.label}
              </option>
            ))}
          </optgroup>
        )}

        <optgroup label="All Global Currencies">
          {otherList.map(c => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </optgroup>

        <optgroup label="──────────────────">
          <option value="__ADD_CUSTOM__" className="font-semibold text-indigo-600 dark:text-indigo-400">
            + Add custom currency manually...
          </option>
        </optgroup>
      </select>

      {/* Manual Currency Addition Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0f1118] p-6 shadow-2xl text-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Add Custom Currency
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add any country currency or custom token
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCustom} className="space-y-4 pt-4">
              {modalError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. NPR, INR, KWD, BDT, USDT"
                  maxLength={6}
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value.toUpperCase())}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.04] px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors w-full font-mono uppercase"
                  autoFocus
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Standard 3-5 letter abbreviation (e.g. NPR for Nepal, INR for India)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency Symbol / Sign (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. रू, ₹, KD, د.إ, $"
                  maxLength={8}
                  value={customSymbol}
                  onChange={e => setCustomSymbol(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.04] px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Label (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nepalese Rupee (रू)"
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.04] px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors w-full"
                />
              </div>

              {/* Live Preview Box */}
              {customCode.trim() && (
                <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 p-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Invoice Format Preview:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {fmtCurrency(2500, customCode.trim())}
                  </span>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save & Apply Currency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
