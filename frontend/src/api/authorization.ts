import { monitorfishApiKy } from '.'

import type { UserAuthorization } from '../domain/entities/authorization/types'

/**
 * Get the user authorization
 */
export async function getCurrentUserAuthorizationFromAPI(): Promise<UserAuthorization> {
  try {
    const userAuthorization = await monitorfishApiKy.get(`/bff/v1/authorization/current`).json<UserAuthorization>()
    // An OK HTTP code mean the user is known
    userAuthorization.isLogged = true

    return userAuthorization
  } catch (err) {
    return {
      isLogged: false,
      isSuperUser: false
    }
  }
}
