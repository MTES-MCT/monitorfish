import { User } from 'oidc-client-ts'

import { Env } from '../domain/types/env'
import { env } from '../utils/env'

export function getOIDCUser() {
  const OIDC_AUTHORITY = env(Env.VITE_OIDC_AUTHORITY)
  const OIDC_CLIENT_ID = env(Env.VITE_OIDC_CLIENT_ID)

  const oidcStorage = localStorage.getItem(`oidc.user:${OIDC_AUTHORITY}:${OIDC_CLIENT_ID}`)
  if (!oidcStorage) {
    return null
  }

  return User.fromStorageString(oidcStorage)
}
