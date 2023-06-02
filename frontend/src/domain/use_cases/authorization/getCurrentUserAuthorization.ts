import { getCurrentUserAuthorizationFromAPI } from '../../../api/authorization'

import type { UserAuthorization } from '../../entities/authorization/types'

export const getCurrentUserAuthorization = (): Promise<UserAuthorization> => getCurrentUserAuthorizationFromAPI()
