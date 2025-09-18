import { ROUTER_PATHS } from '../../paths'
import { useGetCurrentUserAuthorizationQuery } from '../apis'
import { getOIDCConfig } from '../getOIDCConfig'

type UseQueryOptions = Parameters<typeof useGetCurrentUserAuthorizationQuery>[1]

export const useGetCurrentUserAuthorizationQueryOverride = (options: UseQueryOptions = {}) => {
  const oidcConfig = getOIDCConfig()
  const { pathname } = window.location

  const { skip, ...optionsWithoutSkip } = options

  const response = useGetCurrentUserAuthorizationQuery(undefined, {
    skip: !oidcConfig.IS_OIDC_ENABLED || !!skip,
    ...optionsWithoutSkip
  })

  /**
   * This is used to have backward compatibility with the Apache .htacess authentication (on `/` and `/ext`) when the authentication
   * is not activated, as the app is only protected by the entrypoint path.
   */
  if (!oidcConfig.IS_OIDC_ENABLED) {
    if (pathname === ROUTER_PATHS.ext) {
      return { data: { isAuthenticated: true, isSuperUser: false }, isLoading: false, isSuccess: true }
    }

    return { data: { isAuthenticated: true, isSuperUser: true }, isLoading: false, isSuccess: true }
  }

  return response
}
