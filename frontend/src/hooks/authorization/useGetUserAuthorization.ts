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
      setUserAuthorization({
        isLogged: true,
        isSuperUser: true
      })

      return
    }

    getCurrentUserAuthorization().then(nextUserAuthorization => {
      setUserAuthorization(nextUserAuthorization)
    })
  }, [IS_OIDC_ENABLED])

  return userAuthorization
}
