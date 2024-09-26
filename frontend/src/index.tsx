import { browserTracingIntegration, init, replayIntegration } from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'

import { App } from './App'
import { getOIDCConfig } from './auth/getOIDCConfig'

import 'rsuite/dist/rsuite.min.css'
import 'nouislider/dist/nouislider.css'
import 'ol/ol.css'
import '@mtes-mct/monitor-ui/assets/stylesheets/rsuite-override.css'

if (import.meta.env.FRONTEND_SENTRY_DSN && import.meta.env.FRONTEND_SENTRY_TRACING_ORIGINS) {
  init({
    dsn: import.meta.env.FRONTEND_SENTRY_DSN,
    environment: import.meta.env.FRONTEND_SENTRY_ENV ?? 'development',
    integrations: [browserTracingIntegration(), replayIntegration()],
    release: import.meta.env.FRONTEND_MONITORFISH_VERSION ?? 'v0.0.0',
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    tracePropagationTargets: [import.meta.env.FRONTEND_SENTRY_TRACING_ORIGINS],
    tracesSampleRate: 1.0
  })
}

const container = document.getElementById('root')
if (!container) {
  throw new Error('Cannot find container element with id #root.')
}
const root = createRoot(container)

const { IS_OIDC_ENABLED, oidcConfig } = getOIDCConfig()

if (IS_OIDC_ENABLED) {
  root.render(
    <StrictMode>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <AuthProvider {...oidcConfig}>
        <App />
      </AuthProvider>
    </StrictMode>
  )
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
