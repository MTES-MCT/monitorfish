import { isUnauthorizedOrForbidden } from '@api/utils'

import { ROUTER_PATHS } from '../paths'

import type { CustomResponseError } from '@api/types'

/**
 * Redirect to Login page if any HTTP request in Unauthorized
 */
export function redirectToLoginIfUnauthorized(error: CustomResponseError) {
  if (!error.path.includes(ROUTER_PATHS.backendForFrontend) || !isUnauthorizedOrForbidden(error.status)) {
    return
  }

  // We don't use `router.navigate()` to avoid circular dependency issues
  window.location.href = ROUTER_PATHS.login
}
