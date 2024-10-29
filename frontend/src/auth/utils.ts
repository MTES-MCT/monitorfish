import { isUnauthorizedOrForbidden } from '@api/utils'

import { ROUTER_PATHS } from '../paths'
import { router } from '../router'

import type { CustomResponseError } from '@api/types'

/**
 * Redirect to Login page if any HTTP request in Unauthorized
 */
export function redirectToLoginIfUnauthorized(error: CustomResponseError) {
  if (!error.path.includes(ROUTER_PATHS.backendForFrontend) || !isUnauthorizedOrForbidden(error.status)) {
    return
  }

  router.navigate(ROUTER_PATHS.login, { replace: true })
}
