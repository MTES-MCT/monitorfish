import { User } from 'oidc-client-ts'

export function getOIDCUser() {
  const OIDC_AUTHORITY = import.meta.env.FRONTEND_OIDC_AUTHORITY
  const OIDC_CLIENT_ID = import.meta.env.FRONTEND_OIDC_CLIENT_ID

  const oidcStorage = localStorage.getItem(`oidc.user:${OIDC_AUTHORITY}:${OIDC_CLIENT_ID}`)
  if (!oidcStorage) {
    return null
  }

  return User.fromStorageString(oidcStorage)
}
