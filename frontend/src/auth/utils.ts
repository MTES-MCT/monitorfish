import { isUnauthorizedOrForbidden } from '@api/utils'
import { trackEvent } from '@hooks/useTracking'

import { ROUTER_PATHS } from '../paths'

import type { CustomResponseError } from '@api/types'

/**
 * Redirect to Login page if any HTTP request in Unauthorized
 */
export function redirectToLoginIfUnauthorized(error: CustomResponseError) {
  if (!error.path.includes(ROUTER_PATHS.backendForFrontend) || !isUnauthorizedOrForbidden(error.status)) {
    return
  }

  if (!window.location.pathname.includes(ROUTER_PATHS.login)) {
    trackEvent({
      action: 'LOGIN',
      category: 'REDIRECTION',
      name: 'Après une erreur API 401'
    })

    // We don't use `router.navigate()` to avoid circular dependency issues
    window.location.href = ROUTER_PATHS.login
  }
}
