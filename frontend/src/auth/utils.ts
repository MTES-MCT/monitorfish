import { HttpStatusCode } from '@api/constants'

import { paths } from '../paths'
import { router } from '../router'

import type { CustomResponseError } from '@api/types'

/**
 * Redirect to Login page if any HTTP request in Unauthorized
 */
export function redirectToLoginIfUnauthorized(error: CustomResponseError) {
  if (!error.path.includes(paths.backendForFrontend) || error.status !== HttpStatusCode.UNAUTHORIZED) {
    return
  }

  router.navigate(paths.login, { replace: true })
}
