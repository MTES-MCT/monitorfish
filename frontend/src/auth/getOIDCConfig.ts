import { WebStorageStateStore } from 'oidc-client-ts'

export function getOIDCConfig() {
  const IS_OIDC_ENABLED = import.meta.env.VITE_OIDC_ENABLED === 'true'
  const OIDC_REDIRECT_URI = import.meta.env.VITE_OIDC_REDIRECT_URI
  const OIDC_AUTHORITY = import.meta.env.VITE_OIDC_AUTHORITY
  const OIDC_CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID

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
    scope: 'openid email',
    userStore: new WebStorageStateStore({ store: window.localStorage })
  }

  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    IS_OIDC_ENABLED: import.meta.env.VITE_CYPRESS_TEST ? false : IS_OIDC_ENABLED,
    oidcConfig
  }
}
