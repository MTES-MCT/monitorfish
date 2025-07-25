// https://vitejs.dev/guide/env-and-mode#intellisense-for-typescript

interface ImportMetaEnv {
  readonly FRONTEND_GEOSERVER_LOCAL_URL: string
  readonly FRONTEND_GEOSERVER_REMOTE_URL: string
  readonly FRONTEND_KEPLER_ACTIVITY_VISUALIZATION_ENABLED: string
  readonly FRONTEND_MAPBOX_KEY: string
  readonly FRONTEND_MATOMO_ID: string
  readonly FRONTEND_MATOMO_URL: string
  readonly FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED: string
  readonly FRONTEND_MISSION_FORM_AUTO_UPDATE_ENABLED: string
  readonly FRONTEND_MONITORENV_URL: string
  readonly FRONTEND_MONITORFISH_VERSION?: string
  readonly FRONTEND_OIDC_AUTHORITY: string
  readonly FRONTEND_OIDC_CLIENT_ID: string
  readonly FRONTEND_OIDC_ENABLED: string
  readonly FRONTEND_OIDC_LOGOUT_REDIRECT_URI: string
  readonly FRONTEND_OIDC_REDIRECT_URI: string
  readonly FRONTEND_PRIOR_NOTIFICATION_LIST_ENABLED: string
  readonly FRONTEND_SENTRY_DSN?: string
  readonly FRONTEND_SENTRY_ENV?: string
  readonly FRONTEND_SENTRY_TRACING_ORIGINS?: string
  readonly FRONTEND_SHOM_KEY: string
  readonly FRONTEND_VESSEL_LIST_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
