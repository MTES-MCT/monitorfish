import { getIsSuperUserFromAPI } from '../../../api/authorization'

/**
 * Set the user rights for the logged user
 */
export const getIsSuperUser = () => (): Promise<boolean> =>
  getIsSuperUserFromAPI()
    .then(() => true)
    .catch(() => false)
