import { useEffect, useState } from 'react'

import { getEnvironmentVariable } from '../../api/utils'
import { getCurrentUserAuthorization } from '../../domain/use_cases/authorization/getCurrentUserAuthorization'

import type { UserAuthorization } from '../../domain/entities/authorization/types'

/**
 * Get user authorization
 */
export function useGetUserAuthorization(): UserAuthorization | undefined {
  const IS_OIDC_ENABLED = getEnvironmentVariable('REACT_APP_OIDC_ENABLED')
  const [userAuthorization, setUserAuthorization] = useState<UserAuthorization | undefined>(undefined)

  useEffect(() => {
    if (!IS_OIDC_ENABLED) {
      /**
       * This is used to have backward compatibility with the Apache .htacess authentication (on `/` and `/ext`) while the authentication
       * is not yet activated, as the app is only protected by the entrypoint path.
       */
      const isExtPage = window.location.pathname === '/ext' || window.location.pathname === '/nav'

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
