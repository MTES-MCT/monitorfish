import { getCurrentUserAuthorizationFromAPI } from '@api/authorization'
import { isCypress } from '@utils/isCypress'

import type { UserAuthorization } from '../../entities/authorization/types'

export const getCurrentUserAuthorization = (): Promise<UserAuthorization | undefined> => {
  const IS_OIDC_ENABLED = isCypress() || import.meta.env.FRONTEND_OIDC_ENABLED === 'true'

  if (!IS_OIDC_ENABLED) {
    /**
     * This is used to have backward compatibility with the Apache .htacess authentication (on `/` and `/ext`) while the authentication
     * is not yet activated, as the app is only protected by the entrypoint path.
     */
    const isExtPage = window.location.pathname === '/ext' || window.location.pathname === '/light'

    return Promise.resolve({
      isLogged: true,
      isSuperUser: !isExtPage,
      mustReload: false
    })
  }

  return getCurrentUserAuthorizationFromAPI()
}
