/**
 * Compute a SHA-256 with Web Crypto API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 */
export async function sha256(hashed: string) {
  const utf8 = new TextEncoder().encode(hashed)

  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map(bytes => bytes.toString(16).padStart(2, '0')).join('')
}
