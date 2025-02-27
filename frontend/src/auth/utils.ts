import { isUnauthorizedOrForbidden } from '@api/utils'
import { trackEvent } from '@hooks/useTracking'

import { ROUTER_PATHS } from '../paths'

import type { CustomResponseError } from '@api/types'

/**
 * Redirect to Login page if any HTTP request in Unauthorized
 */
export function redirectToLoginIfUnauthorized(error: CustomResponseError, email?: string | undefined) {
  if (!error.path.includes(ROUTER_PATHS.backendForFrontend) || !isUnauthorizedOrForbidden(error.status)) {
    return
  }

  if (!window.location.pathname.includes(ROUTER_PATHS.login)) {
    trackEvent({
      action: 'Redirection vers la page de login après une erreur API 401',
      category: 'REDIRECTION',
      name: email ?? ''
    })

    // We don't use `router.navigate()` to avoid circular dependency issues
    window.location.href = ROUTER_PATHS.login
  }
}
