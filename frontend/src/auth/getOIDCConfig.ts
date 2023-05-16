import { WebStorageStateStore } from 'oidc-client-ts'

import { getEnvironmentVariable } from '../api/utils'

export function getOIDCConfig() {
  const IS_OIDC_ENABLED = getEnvironmentVariable('REACT_APP_OIDC_ENABLED')
  const OIDC_REDIRECT_URI = getEnvironmentVariable('REACT_APP_OIDC_REDIRECT_URI')
  const OIDC_AUTHORITY = getEnvironmentVariable('REACT_APP_OIDC_AUTHORITY')
  const OIDC_CLIENT_ID = getEnvironmentVariable('REACT_APP_OIDC_CLIENT_ID')

  if (IS_OIDC_ENABLED && (!OIDC_REDIRECT_URI || !OIDC_AUTHORITY || !OIDC_CLIENT_ID)) {
    throw new Error('Cannot setup Cerbère authentication.')
  }

  const onSigninCallback = () => {
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  const oidcConfig = {
    authority: String(OIDC_AUTHORITY),
    client_id: String(OIDC_CLIENT_ID),
    onSigninCallback,
    redirect_uri: String(OIDC_REDIRECT_URI),
    userStore: new WebStorageStateStore({ store: window.localStorage })
  }

  return {
    IS_OIDC_ENABLED,
    oidcConfig
  }
}
