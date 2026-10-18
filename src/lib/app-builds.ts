import QRCode from 'qrcode'

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return ''
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(1))
  return `${formatted} ${sizes[i]}`
}

export function getEnvironmentConfig(env: string) {
  switch (env) {
    case 'production':
      return {
        label: 'Production Release',
        shortLabel: 'Production',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
        dotClass: 'bg-emerald-500',
      }
    case 'client_review':
      return {
        label: 'Client Review Ready',
        shortLabel: 'Client Review',
        badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
        dotClass: 'bg-indigo-500',
      }
    case 'internal_beta':
      return {
        label: 'Internal Beta',
        shortLabel: 'Beta',
        badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        dotClass: 'bg-purple-500',
      }
    case 'staging':
    default:
      return {
        label: 'Staging / Test Build',
        shortLabel: 'Staging',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        dotClass: 'bg-amber-500',
      }
  }
}

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 256,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
  } catch (err) {
    console.error('Failed to generate QR code', err)
    return ''
  }
}
