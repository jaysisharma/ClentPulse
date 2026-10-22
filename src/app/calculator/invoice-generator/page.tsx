'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ToolsSubnav } from '@/components/tools/tools-subnav'
import {
  FileText, Printer, Plus, Trash2, Sparkles, Upload,
  Download, RefreshCw, Check, ArrowUpRight, DollarSign,
  ShieldCheck, HelpCircle
} from 'lucide-react'

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)' },
  { code: 'AUD', symbol: 'AU$', label: 'AUD (AU$)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF' },
  { code: 'SGD', symbol: 'SG$', label: 'SGD (SG$)' },
]

export default function FreeInvoiceGeneratorPage() {
  const [currency, setCurrency] = useState('USD')
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001')
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [paymentTerms, setPaymentTerms] = useState('Net 14')

  // From (Sender)
  const [fromName, setFromName] = useState('Atlas Creative Studio')
  const [fromEmail, setFromEmail] = useState('billing@atlasstudio.design')
  const [fromAddress, setFromAddress] = useState('742 Evergreen Terrace, Suite 400\nSan Francisco, CA 94107')
  const [fromTaxId, setFromTaxId] = useState('US-EIN 94-8829102')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoError, setLogoError] = useState('')

  // Bill To (Client)
  const [toName, setToName] = useState('Acme Corporation')
  const [toEmail, setToEmail] = useState('ap@acmecorp.com')
  const [toAddress, setToAddress] = useState('100 Silicon Way, 5th Floor\nAustin, TX 78701')

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Brand Identity Design & Visual System', quantity: 1, unitPrice: 3500 },
    { id: '2', description: 'Design System & Figma Component Library', quantity: 1, unitPrice: 2200 },
    { id: '3', description: 'Responsive Marketing Website UI/UX (6 pages)', quantity: 1, unitPrice: 2800 },
  ])

  // Adjustments
  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxPercent, setTaxPercent] = useState(0)
  const [shipping, setShipping] = useState(0)

  // Notes & Payment Instructions
  const [notes, setNotes] = useState('Thank you for your business! Please remit payment within the agreed terms.')
  const [paymentInstructions, setPaymentInstructions] = useState(
    'Bank: Silicon Valley Bank\nAccount: 9876543210\nRouting / Swift: SVBUS6S\nPayPal / Stripe: billing@atlasstudio.design'
  )

  const activeCurrencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$'

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const discountAmount = (subtotal * discountPercent) / 100
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = (taxableAmount * taxPercent) / 100
  const grandTotal = Math.max(0, taxableAmount + taxAmount + shipping)

  function formatMoney(amount: number) {
    return `${activeCurrencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function addItem() {
    setItems([
      ...items,
      { id: Math.random().toString(36).substring(2, 9), description: '', quantity: 1, unitPrice: 0 }
    ])
  }

  function removeItem(id: string) {
    if (items.length <= 1) return
    setItems(items.filter(item => item.id !== id))
  }

  function updateItem(id: string, field: keyof LineItem, val: string | number) {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item))
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setLogoError('')
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo file size must be under 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setLogoUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function loadSampleData() {
    setFromName('Vanguard Digital')
    setFromEmail('finance@vanguard.io')
    setFromAddress('250 Hudson St, New York, NY 10013')
    setFromTaxId('US-EIN 13-9920141')
    setToName('FinScale Technologies')
    setToEmail('invoices@finscale.io')
    setToAddress('500 Howard St, San Francisco, CA 94105')
    setItems([
      { id: '1', description: 'Product Design Sprint (Mobile App MVP)', quantity: 1, unitPrice: 4800 },
      { id: '2', description: 'Frontend Implementation in Next.js & Tailwind', quantity: 40, unitPrice: 125 },
      { id: '3', description: 'Stripe Billing & Webhook Integration', quantity: 1, unitPrice: 1500 },
    ])
    setDiscountPercent(5)
    setTaxPercent(8.25)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-100 selection:bg-indigo-500/20 flex flex-col justify-between">
      
      {/* Background Ambience */}
      <div className="print:hidden absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,rgba(168,85,247,0.08)_40%,transparent_75%)] blur-3xl opacity-75" />
      </div>

      {/* Top Header */}
      <header className="print:hidden w-full border-b border-white/5 py-4 px-6 sticky top-0 bg-[#08090a]/85 backdrop-blur-xl z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo className="w-6 h-6 text-white transition-transform group-hover:scale-105" />
            <span className="font-bold text-sm tracking-tight text-white">Frevio</span>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full ml-1">
              Tools
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-sm"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        
        <div className="print:hidden">
          <ToolsSubnav />

          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-mono text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Free · No Sign Up · Instant PDF Export</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-light uppercase tracking-[-0.02em] text-white">
              Free Online <span className="text-indigo-400">Invoice Generator</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
              Create, customize, and print client-ready invoices in seconds. Download a crisp PDF or print directly with zero watermarks.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-2xl border border-white/10 bg-[#0e1017]/90 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-mono">Currency:</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="bg-[#14161f] border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={loadSampleData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Load Sample</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── THE INVOICE SHEET ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0d12] print:bg-white print:border-none print:shadow-none p-6 sm:p-12 shadow-2xl ring-1 ring-white/5 text-slate-200 print:text-black">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-white/10 print:border-slate-300">
            <div>
              {logoUrl ? (
                <div className="relative group mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="max-h-16 max-w-[180px] object-contain rounded" />
                  <button
                    onClick={() => setLogoUrl(null)}
                    className="print:hidden text-[10px] text-rose-400 hover:underline mt-1 block"
                  >
                    Remove logo
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="print:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 hover:border-indigo-400 bg-white/5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload logo (PNG/JPG)</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoError && (
                    <p className="text-[11px] text-rose-400 mt-1 font-mono">{logoError}</p>
                  )}
                </div>
              )}

              <input
                type="text"
                value={fromName}
                onChange={e => setFromName(e.target.value)}
                placeholder="Your Studio or Company Name"
                className="w-full text-xl font-bold bg-transparent text-white print:text-black border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <textarea
                value={fromAddress}
                onChange={e => setFromAddress(e.target.value)}
                placeholder="Address line 1, City, State, ZIP"
                rows={2}
                className="w-full text-xs text-slate-400 print:text-slate-600 bg-transparent resize-none border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none mt-1"
              />
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={fromEmail}
                  onChange={e => setFromEmail(e.target.value)}
                  placeholder="billing@yourdomain.com"
                  className="text-xs text-slate-400 print:text-slate-600 bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-slate-600">·</span>
                <input
                  type="text"
                  value={fromTaxId}
                  onChange={e => setFromTaxId(e.target.value)}
                  placeholder="Tax ID / VAT #"
                  className="text-xs text-slate-400 print:text-slate-600 bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Right Meta Column */}
            <div className="text-left sm:text-right space-y-2">
              <div className="text-3xl sm:text-4xl font-light uppercase tracking-wider text-white print:text-black">
                INVOICE
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-2 text-xs">
                <span className="text-slate-400 print:text-slate-600">Invoice #:</span>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="font-mono font-semibold text-right bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none text-white print:text-black"
                />
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-2 text-xs">
                <span className="text-slate-400 print:text-slate-600">Issue Date:</span>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="text-right bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none text-white print:text-black"
                />
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-2 text-xs">
                <span className="text-slate-400 print:text-slate-600">Due Date:</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="text-right bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none text-white print:text-black"
                />
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-2 text-xs">
                <span className="text-slate-400 print:text-slate-600">Terms:</span>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  className="text-right bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none text-white print:text-black"
                />
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="py-6 border-b border-white/10 print:border-slate-300">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 print:text-indigo-600 font-bold">
              Billed To:
            </span>
            <div className="mt-1 max-w-sm space-y-1">
              <input
                type="text"
                value={toName}
                onChange={e => setToName(e.target.value)}
                placeholder="Client Name or Organization"
                className="w-full text-base font-semibold bg-transparent text-white print:text-black border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="email"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="client.billing@example.com"
                className="w-full text-xs text-slate-400 print:text-slate-600 bg-transparent border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none"
              />
              <textarea
                value={toAddress}
                onChange={e => setToAddress(e.target.value)}
                placeholder="Client Street, City, Country"
                rows={2}
                className="w-full text-xs text-slate-400 print:text-slate-600 bg-transparent resize-none border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 print:border-slate-300 text-slate-400 print:text-slate-600 font-mono text-[11px]">
                  <th className="pb-3 w-[50%]">Item Description</th>
                  <th className="pb-3 w-[15%] text-right">Quantity</th>
                  <th className="pb-3 w-[15%] text-right">Rate ({activeCurrencySymbol})</th>
                  <th className="pb-3 w-[15%] text-right">Amount</th>
                  <th className="print:hidden pb-3 w-[5%] text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-200">
                {items.map((item) => {
                  const lineTotal = item.quantity * item.unitPrice
                  return (
                    <tr key={item.id} className="group">
                      <td className="py-3 pr-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Service or deliverable description"
                          className="w-full bg-transparent text-white print:text-black border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none py-1"
                        />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-16 text-right bg-transparent text-white print:text-black border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none py-1 font-mono"
                        />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 text-right bg-transparent text-white print:text-black border-b border-transparent hover:border-white/20 focus:border-indigo-500 focus:outline-none py-1 font-mono"
                        />
                      </td>
                      <td className="py-3 pl-2 text-right font-mono font-semibold text-white print:text-black">
                        {formatMoney(lineTotal)}
                      </td>
                      <td className="print:hidden py-3 text-right">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Delete line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <button
              type="button"
              onClick={addItem}
              className="print:hidden mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/20 hover:border-indigo-400 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add Line Item</span>
            </button>
          </div>

          {/* Totals & Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6 border-t border-white/10 print:border-slate-300">
            
            {/* Left Column: Notes & Bank Wire info */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 print:text-slate-600 block mb-1">
                  Payment Instructions & Bank Details
                </label>
                <textarea
                  value={paymentInstructions}
                  onChange={e => setPaymentInstructions(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-mono text-slate-300 print:text-slate-700 bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 print:text-slate-600 block mb-1">
                  Notes & Terms
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs text-slate-300 print:text-slate-700 bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Right Column: Mathematical Summary */}
            <div className="md:col-span-5 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-400 print:text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono text-white print:text-black">{formatMoney(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-400 print:text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Discount (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-12 text-right bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-white print:text-black font-mono"
                  />
                </span>
                <span className="font-mono text-white print:text-black">
                  -{formatMoney(discountAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-400 print:text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Tax (%):</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={taxPercent}
                    onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-14 text-right bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-white print:text-black font-mono"
                  />
                </span>
                <span className="font-mono text-white print:text-black">
                  +{formatMoney(taxAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-400 print:text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Extra / Shipping:</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={shipping}
                    onChange={e => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-16 text-right bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-white print:text-black font-mono"
                  />
                </span>
                <span className="font-mono text-white print:text-black">
                  +{formatMoney(shipping)}
                </span>
              </div>

              <div className="flex justify-between py-3 border-t border-white/10 print:border-slate-400 text-sm font-semibold">
                <span className="text-white print:text-black">Total Due:</span>
                <span className="font-mono text-lg text-emerald-400 print:text-emerald-700">
                  {formatMoney(grandTotal)}
                </span>
              </div>
            </div>

          </div>

          {/* Print Footer Watermark / Signature */}
          <div className="mt-12 pt-6 border-t border-white/5 print:border-slate-200 text-center text-[10px] text-slate-500 print:text-slate-500 font-mono">
            Generated via Frevio Invoice Generator · Payment terms subject to project contract.
          </div>

        </div>

        {/* ── HIGH CONVERTING FREVIO CONVERSION BANNER ─────────────────── */}
        <div className="print:hidden mt-12 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-[#0e1017] p-8 text-center space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Automate your agency billing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-white uppercase tracking-tight">
            Tired of manually chasing invoices?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Frevio automatically tracks when clients open your invoice, collects instant card & ACH payments via Stripe with 0% extra platform fees, and dispatches friendly email reminders before due dates.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-lg shadow-white/10"
            >
              <span>Create Free Frevio Workspace</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="print:hidden border-t border-white/5 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <p>© {new Date().getFullYear()} Frevio. All rights reserved.</p>
      </footer>

    </div>
  )
}
