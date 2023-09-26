import { User } from 'oidc-client-ts'

import { getEnvironmentVariable } from '../utils/getEnvironmentVariable'

export function getOIDCUser() {
  const OIDC_AUTHORITY = getEnvironmentVariable('VITE_OIDC_AUTHORITY')
  const OIDC_CLIENT_ID = getEnvironmentVariable('VITE_OIDC_CLIENT_ID')

  const oidcStorage = localStorage.getItem(`oidc.user:${OIDC_AUTHORITY}:${OIDC_CLIENT_ID}`)
  if (!oidcStorage) {
    return null
  }

  return User.fromStorageString(oidcStorage)
}
