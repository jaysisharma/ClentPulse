export interface CurrencyConfig {
  code: string
  symbol: string
  label: string
  locale: string
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'en-IE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'CAD ($)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'AUD ($)', locale: 'en-AU' },
}

export const CURRENCIES = Object.values(SUPPORTED_CURRENCIES)

export function getCurrency(code?: string): CurrencyConfig {
  const curr = (code || 'USD').toUpperCase()
  return SUPPORTED_CURRENCIES[curr] ?? SUPPORTED_CURRENCIES.USD
}

export function fmtCurrency(amount: number, currency = 'USD'): string {
  const curr = (currency || 'USD').toUpperCase()
  const config = SUPPORTED_CURRENCIES[curr] ?? SUPPORTED_CURRENCIES.USD
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${config.symbol}${amount.toFixed(2)}`
  }
}

