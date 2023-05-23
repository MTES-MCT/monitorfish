import { monitorfishApiKy } from '.'

/**
 * Get the user authorization
 */
export async function getIsSuperUserFromAPI() {
  return monitorfishApiKy.get(`/bff/v1/authorization/is_super_user`)
}
