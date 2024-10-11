import { HttpStatusCode } from '@api/constants'

import { paths } from '../paths'
import { router } from '../router'
import { getOIDCConfig } from './getOIDCConfig'

import type { CustomResponseError } from '@api/types'

/**
 * Redirect to Login page if any HTTP request in Unauthorized
 * @param error
 */
export function redirectToLoginIfUnauthorized(error: CustomResponseError) {
  const { IS_OIDC_ENABLED } = getOIDCConfig()
  if (!IS_OIDC_ENABLED) {
    return
  }

  if (!error.path.includes(paths.backendForFrontend) || error.status !== HttpStatusCode.UNAUTHORIZED) {
    return
  }

  router.navigate(paths.login, { replace: true })
}
