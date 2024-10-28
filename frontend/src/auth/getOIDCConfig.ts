import { isCypress } from '@utils/isCypress'
import { WebStorageStateStore } from 'oidc-client-ts'

const IS_CYPRESS = isCypress()

export function getOIDCConfig() {
  const IS_OIDC_ENABLED = import.meta.env.FRONTEND_OIDC_ENABLED === 'true'
  const OIDC_REDIRECT_URI = import.meta.env.FRONTEND_OIDC_REDIRECT_URI
  const OIDC_LOGOUT_REDIRECT_URI = import.meta.env.FRONTEND_OIDC_LOGOUT_REDIRECT_URI
  const OIDC_AUTHORITY = import.meta.env.FRONTEND_OIDC_AUTHORITY
  const OIDC_CLIENT_ID = import.meta.env.FRONTEND_OIDC_CLIENT_ID

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
    post_logout_redirect_uri: String(OIDC_LOGOUT_REDIRECT_URI),
    redirect_uri: String(OIDC_REDIRECT_URI),
    scope: 'openid email',
    userStore: new WebStorageStateStore({ store: window.localStorage })
  }

  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    IS_OIDC_ENABLED: IS_CYPRESS ? false : IS_OIDC_ENABLED,
    oidcConfig
  }
}
