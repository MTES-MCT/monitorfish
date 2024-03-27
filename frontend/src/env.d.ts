// https://vitejs.dev/guide/env-and-mode#intellisense-for-typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly FRONTEND_GEOSERVER_LOCAL_URL: string
  readonly FRONTEND_GEOSERVER_REMOTE_URL: string
  readonly FRONTEND_MAPBOX_KEY: string
  readonly FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED: string
  readonly FRONTEND_MISSION_FORM_AUTO_UPDATE_ENABLED: string
  readonly FRONTEND_MONITORENV_URL: string
  readonly FRONTEND_OIDC_AUTHORITY: string
  readonly FRONTEND_OIDC_CLIENT_ID: string
  readonly FRONTEND_OIDC_ENABLED: string
  readonly FRONTEND_OIDC_REDIRECT_URI: string
  readonly FRONTEND_SENTRY_DSN?: string
  readonly FRONTEND_SHOM_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
