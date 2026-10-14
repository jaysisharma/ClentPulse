/**
 * Universal cryptographic audit seal generator for contracts and documents.
 * Works seamlessly in both browser (Client Components) and Node.js environments
 * using the standard Web Crypto API.
 */

export interface SignatureReceipt {
  seal: string
  hash: string
  timestamp: string
  signerName: string
  algorithm: string
}

/**
 * Computes a tamper-evident SHA-256 digital signature seal.
 */
export async function generateDigitalSeal(
  documentId: string,
  title: string,
  signerName: string,
  timestamp: string
): Promise<SignatureReceipt> {
  const raw = `${documentId}::${title}::${signerName.trim()}::${timestamp}`
  const encoder = new TextEncoder()
  const data = encoder.encode(raw)

  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const seal = `SEAL-${hash.slice(0, 8).toUpperCase()}-${hash.slice(8, 16).toUpperCase()}`

  return {
    seal,
    hash,
    timestamp,
    signerName: signerName.trim(),
    algorithm: 'SHA-256-DIGITAL-RECORD',
  }
}
