import { BrowserTracing } from '@sentry/browser'
import { init } from '@sentry/react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, withAuth } from 'react-oidc-context'

import { App } from './App'
import 'rsuite/dist/rsuite.min.css'
import 'nouislider/dist/nouislider.css'
import './ui/assets/index.css'
import 'ol/ol.css'
import './ui/assets/App.css'
import './ui/shared/ol-override.css'
import './ui/shared/rsuite-override.css'
import { getOIDCConfig } from './auth/getOIDCConfig'
// eslint-disable-next-line import/no-relative-packages
// import '@mtes-mct/monitor-ui/assets/stylesheets/rsuite-override.css'

if (import.meta.env.PROD) {
  // https://docs.sentry.io/platforms/javascript/performance/#configure-the-sample-rate
  init({
    dsn: import.meta.env.FRONTEND_SENTRY_DSN || '',
    environment: import.meta.env.FRONTEND_SENTRY_ENV || '',
    integrations: [
      new BrowserTracing({
        tracingOrigins: import.meta.env.FRONTEND_SENTRY_TRACING_ORIGINS
          ? [import.meta.env.FRONTEND_SENTRY_TRACING_ORIGINS || '']
          : []
      })
    ],
    release: import.meta.env.FRONTEND_MONITORFISH_VERSION || '',
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
  const AppWithAuth = withAuth(App)

  root.render(
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AuthProvider {...oidcConfig}>
      <AppWithAuth />
    </AuthProvider>
  )
} else {
  root.render(<App />)
}
