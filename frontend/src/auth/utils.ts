import { isUnauthorizedOrForbidden } from '@api/utils'

import { paths } from '../paths'
import { router } from '../router'

import type { CustomResponseError } from '@api/types'

/**
 * Redirect to Login page if any HTTP request in Unauthorized
 */
export function redirectToLoginIfUnauthorized(error: CustomResponseError) {
  if (!error.path.includes(paths.backendForFrontend) || !isUnauthorizedOrForbidden(error.status)) {
    return
  }

  router.navigate(paths.login, { replace: true })
}
