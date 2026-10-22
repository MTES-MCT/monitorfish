// Names used by Spring Security `CookieCsrfTokenRepository` (see backend `SecurityConfig.kt`)
const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
export const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'

export function getCsrfToken(): string | undefined {
  const cookie = document.cookie.split('; ').find(cookieEntry => cookieEntry.startsWith(`${CSRF_COOKIE_NAME}=`))
  if (!cookie) {
    return undefined
  }

  return decodeURIComponent(cookie.slice(CSRF_COOKIE_NAME.length + 1))
}

export function getCsrfHeaders(): Record<string, string> {
  const csrfToken = getCsrfToken()

  return csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {}
}
