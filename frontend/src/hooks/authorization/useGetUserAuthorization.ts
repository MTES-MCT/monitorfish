import { useEffect, useState } from 'react'

import { getCurrentUserAuthorization } from '../../domain/use_cases/authorization/getCurrentUserAuthorization'
import { getEnvironmentVariable } from '../../utils/getEnvironmentVariable'

import type { UserAuthorization } from '../../domain/entities/authorization/types'

/**
 * Get user authorization
 */
export function useGetUserAuthorization(): UserAuthorization | undefined {
  const IS_OIDC_ENABLED = getEnvironmentVariable('VITE_OIDC_ENABLED')
  const [userAuthorization, setUserAuthorization] = useState<UserAuthorization | undefined>(undefined)

  useEffect(() => {
    if (!IS_OIDC_ENABLED) {
      /**
       * This is used to have backward compatibility with the Apache .htacess authentication (on `/` and `/ext`) while the authentication
       * is not yet activated, as the app is only protected by the entrypoint path.
       */
      const isExtPage = window.location.href.includes('/ext')

      setUserAuthorization({
        isLogged: true,
        isSuperUser: !isExtPage
      })

      return
    }

    getCurrentUserAuthorization().then(nextUserAuthorization => {
      setUserAuthorization(nextUserAuthorization)
    })
  }, [IS_OIDC_ENABLED])

  return userAuthorization
}
