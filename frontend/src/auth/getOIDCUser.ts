import { User } from 'oidc-client-ts'

import { getEnvironmentVariable } from '../api/utils'

export function getOIDCUser() {
  const OIDC_AUTHORITY = getEnvironmentVariable('REACT_APP_OIDC_AUTHORITY')
  const OIDC_CLIENT_ID = getEnvironmentVariable('REACT_APP_OIDC_CLIENT_ID')

  const oidcStorage = localStorage.getItem(`oidc.user:${OIDC_AUTHORITY}:${OIDC_CLIENT_ID}`)
  if (!oidcStorage) {
    return null
  }

  return User.fromStorageString(oidcStorage)
}
