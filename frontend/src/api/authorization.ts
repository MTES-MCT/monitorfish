import { HTTPError } from 'ky'

import { monitorfishApiKy } from './api'

import type { UserAuthorization } from '../domain/entities/authorization/types'

/**
 * Get the user authorization
 */
export async function getCurrentUserAuthorizationFromAPI(): Promise<UserAuthorization> {
  try {
    const userAuthorization = await monitorfishApiKy.get(`/bff/v1/authorization/current`).json<UserAuthorization>()

    // An OK HTTP code mean the user is known
    return {
      isLogged: true,
      isSuperUser: userAuthorization.isSuperUser,
      mustReload: false
    }
  } catch (err) {
    if ((err as HTTPError).response.status === 401) {
      const authenticateResponse = (err as HTTPError).response.headers.get('WWW-Authenticate')

      // eslint-disable-next-line no-console
      console.error(`Could not authenticate: ${authenticateResponse}`)

      /**
       * We need to reload the app if the WWW-Authenticate header contains:
       * - "authentication is required" : The access_token is missing from the request header.
       *              The user just login but the request did not include the access_token just saved in LocalStorage,
       *              there is a race condition.
       * - "expired": The access_token sent to the backend is expired.
       *              The user juste re-login, but the request did include the previous access_token found in LocalStorage,
       *              there is a race condition.
       */
      if (
        !!authenticateResponse?.includes('authentication is required') ||
        !!authenticateResponse?.includes('expired')
      ) {
        return {
          isLogged: false,
          isSuperUser: false,
          mustReload: true
        }
      }
    }

    return {
      isLogged: false,
      isSuperUser: false,
      mustReload: false
    }
  }
}
