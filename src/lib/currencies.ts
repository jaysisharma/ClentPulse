export interface CurrencyConfig {
  code: string
  symbol: string
  label: string
  locale: string
  isCustom?: boolean
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($ - US Dollar)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€ - Euro)', locale: 'en-IE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£ - British Pound)', locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹ - Indian Rupee)', locale: 'en-IN' },
  NPR: { code: 'NPR', symbol: 'रू', label: 'NPR (रू / Rs - Nepalese Rupee)', locale: 'ne-NP' },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'CAD ($ - Canadian Dollar)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'AUD ($ - Australian Dollar)', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', label: 'JPY (¥ - Japanese Yen)', locale: 'ja-JP' },
  SGD: { code: 'SGD', symbol: 'S$', label: 'SGD (S$ - Singapore Dollar)', locale: 'en-SG' },
  AED: { code: 'AED', symbol: 'AED', label: 'AED (د.إ - UAE Dirham)', locale: 'en-AE' },
  CHF: { code: 'CHF', symbol: 'CHF', label: 'CHF (Swiss Franc)', locale: 'de-CH' },
  BRL: { code: 'BRL', symbol: 'R$', label: 'BRL (R$ - Brazilian Real)', locale: 'pt-BR' },
  MXN: { code: 'MXN', symbol: 'MX$', label: 'MXN ($ - Mexican Peso)', locale: 'es-MX' },
  ZAR: { code: 'ZAR', symbol: 'R', label: 'ZAR (R - South African Rand)', locale: 'en-ZA' },
  NZD: { code: 'NZD', symbol: 'NZ$', label: 'NZD ($ - New Zealand Dollar)', locale: 'en-NZ' },
  PHP: { code: 'PHP', symbol: '₱', label: 'PHP (₱ - Philippine Peso)', locale: 'en-PH' },
  PKR: { code: 'PKR', symbol: 'Rs', label: 'PKR (Rs - Pakistani Rupee)', locale: 'en-PK' },
  BDT: { code: 'BDT', symbol: '৳', label: 'BDT (৳ - Bangladeshi Taka)', locale: 'bn-BD' },
  NGN: { code: 'NGN', symbol: '₦', label: 'NGN (₦ - Nigerian Naira)', locale: 'en-NG' },
  IDR: { code: 'IDR', symbol: 'Rp', label: 'IDR (Rp - Indonesian Rupiah)', locale: 'id-ID' },
  MYR: { code: 'MYR', symbol: 'RM', label: 'MYR (RM - Malaysian Ringgit)', locale: 'ms-MY' },
  THB: { code: 'THB', symbol: '฿', label: 'THB (฿ - Thai Baht)', locale: 'th-TH' },
  VND: { code: 'VND', symbol: '₫', label: 'VND (₫ - Vietnamese Dong)', locale: 'vi-VN' },
  PLN: { code: 'PLN', symbol: 'zł', label: 'PLN (zł - Polish Zloty)', locale: 'pl-PL' },
  SEK: { code: 'SEK', symbol: 'kr', label: 'SEK (kr - Swedish Krona)', locale: 'sv-SE' },
  NOK: { code: 'NOK', symbol: 'kr', label: 'NOK (kr - Norwegian Krone)', locale: 'nb-NO' },
  DKK: { code: 'DKK', symbol: 'kr', label: 'DKK (kr - Danish Krone)', locale: 'da-DK' },
  SAR: { code: 'SAR', symbol: 'SR', label: 'SAR (SR - Saudi Riyal)', locale: 'en-SA' },
  QAR: { code: 'QAR', symbol: 'QR', label: 'QAR (QR - Qatari Riyal)', locale: 'en-QA' },
  KWD: { code: 'KWD', symbol: 'KD', label: 'KWD (KD - Kuwaiti Dinar)', locale: 'en-KW' },
}

export const CURRENCIES = Object.values(SUPPORTED_CURRENCIES)

// In-memory registry for dynamically registered custom currencies
const customCurrenciesRegistry: Record<string, CurrencyConfig> = {}

export const CUSTOM_CURRENCIES_STORAGE_KEY = 'frevio_custom_currencies'

export function registerCustomCurrency(config: CurrencyConfig): void {
  const code = config.code.trim().toUpperCase()
  if (!code) return
  customCurrenciesRegistry[code] = {
    ...config,
    code,
    isCustom: true,
  }
}

export function getSavedCustomCurrencies(): CurrencyConfig[] {
  if (typeof window === 'undefined') return Object.values(customCurrenciesRegistry)
  try {
    const raw = localStorage.getItem(CUSTOM_CURRENCIES_STORAGE_KEY)
    if (!raw) return Object.values(customCurrenciesRegistry)
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      parsed.forEach(c => registerCustomCurrency(c))
      return parsed
    }
  } catch {
    // Ignore storage parse issues
  }
  return Object.values(customCurrenciesRegistry)
}

export function saveCustomCurrency(config: CurrencyConfig): CurrencyConfig[] {
  const code = config.code.trim().toUpperCase()
  if (!code) return getSavedCustomCurrencies()

  const validated: CurrencyConfig = {
    code,
    symbol: config.symbol?.trim() || code,
    label: config.label?.trim() || `${code} (${config.symbol?.trim() || code})`,
    locale: config.locale?.trim() || 'en-US',
    isCustom: true,
  }

  registerCustomCurrency(validated)

  if (typeof window !== 'undefined') {
    try {
      const existing = getSavedCustomCurrencies().filter(c => c.code.toUpperCase() !== code)
      const updated = [...existing, validated]
      localStorage.setItem(CUSTOM_CURRENCIES_STORAGE_KEY, JSON.stringify(updated))
      return updated
    } catch {
      // Ignore localStorage quotas
    }
  }

  return Object.values(customCurrenciesRegistry)
}

export function removeCustomCurrency(code: string): CurrencyConfig[] {
  const target = code.trim().toUpperCase()
  delete customCurrenciesRegistry[target]

  if (typeof window !== 'undefined') {
    try {
      const existing = getSavedCustomCurrencies().filter(c => c.code.toUpperCase() !== target)
      localStorage.setItem(CUSTOM_CURRENCIES_STORAGE_KEY, JSON.stringify(existing))
      return existing
    } catch {
      // Ignore
    }
  }
  return Object.values(customCurrenciesRegistry)
}

export function getAllCurrencies(): CurrencyConfig[] {
  const base = Object.values(SUPPORTED_CURRENCIES)
  const customs = getSavedCustomCurrencies()
  const customMap = new Map<string, CurrencyConfig>()
  customs.forEach(c => customMap.set(c.code.toUpperCase(), c))
  
  // Filter out any custom that overrides built-in with identical code
  const nonDuplicateCustoms = Array.from(customMap.values()).filter(
    c => !SUPPORTED_CURRENCIES[c.code.toUpperCase()]
  )

  return [...base, ...nonDuplicateCustoms]
}

export function getCurrency(code?: string): CurrencyConfig {
  const curr = (code || 'USD').trim().toUpperCase()
  if (SUPPORTED_CURRENCIES[curr]) {
    return SUPPORTED_CURRENCIES[curr]
  }
  if (customCurrenciesRegistry[curr]) {
    return customCurrenciesRegistry[curr]
  }
  if (typeof window !== 'undefined') {
    const saved = getSavedCustomCurrencies().find(c => c.code.toUpperCase() === curr)
    if (saved) return saved
  }
  return {
    code: curr || 'USD',
    symbol: curr || '$',
    label: curr || 'USD',
    locale: 'en-US',
  }
}

export function fmtCurrency(amount: number, currency = 'USD'): string {
  const curr = (currency || 'USD').trim().toUpperCase()

  // High-fidelity standard formatting for Nepalese Rupee
  if (curr === 'NPR') {
    return `रू ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const config = SUPPORTED_CURRENCIES[curr] || customCurrenciesRegistry[curr]
  if (config) {
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${config.symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  }

  // Attempt standard Intl for standard ISO codes (e.g. KWD, CLP, etc.)
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Non-standard ISO or custom manual text/symbol (e.g., USDT, BTC, etc.)
    return `${curr} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

