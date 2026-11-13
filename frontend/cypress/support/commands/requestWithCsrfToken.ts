const HTTP_METHODS = new Set(['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'])

/**
 * Mutations on `/bff` are protected by a CSRF token (double-submit cookie, see backend `SecurityConfig.kt`):
 * send it as the frontend does.
 */
export function requestWithCsrfToken(originalFn: Cypress.CommandOriginalFn<'request'>, ...args: any[]) {
  const options = normalizeRequestArgs(args)

  return cy.getCookie('XSRF-TOKEN', { log: false }).then(cookie => {
    if (!cookie) {
      return originalFn(options)
    }

    return originalFn({
      ...options,
      headers: { ...options.headers, 'X-XSRF-TOKEN': decodeURIComponent(cookie.value) }
    })
  })
}

function normalizeRequestArgs(args: any[]): Partial<Cypress.RequestOptions> {
  const [first, second, third] = args
  if (typeof first === 'object') {
    return first
  }
  if (HTTP_METHODS.has(first) && typeof second === 'string') {
    return { body: third, method: first, url: second }
  }

  return { body: second, url: first }
}
