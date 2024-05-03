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
      isSuperUser: userAuthorization.isSuperUser
    }
  } catch (err) {
    if (err?.response?.status === 401) {
      return {
        isLogged: false,
        isSuperUser: false
      }
    }

    return {
      isLogged: undefined,
      isSuperUser: undefined
    }
  }
}
