import { useEffect, useState } from 'react'

import { getIsSuperUserFromAPI } from '../api/authorization'
import { getEnvironmentVariable } from '../api/utils'

/**
 * Get super user boolean to redirect to the right path
 */
export function useIsSuperUser(): boolean | undefined {
  const IS_OIDC_ENABLED = getEnvironmentVariable('REACT_APP_OIDC_ENABLED')
  const [isSuperUser, setIsSuperUser] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (!IS_OIDC_ENABLED) {
      setIsSuperUser(true)

      return
    }

    getIsSuperUserFromAPI()
      .then(() => {
        setIsSuperUser(true)
      })
      .catch(() => {
        setIsSuperUser(false)
      })
  }, [IS_OIDC_ENABLED])

  return isSuperUser
}
